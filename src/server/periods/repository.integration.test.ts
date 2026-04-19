import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { InviteStatus, PeriodStatus } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import { acceptInvite } from "@/server/invites/repository";
import {
  closePeriodParticipation,
  createExpenseForPeriod,
  deleteExpenseForUser,
  getPairPeriodWorkspace,
  openPeriodForPair,
  reopenPeriod,
  updateExpenseForUser,
} from "@/server/periods/repository";
import { resetDatabase } from "@/test/helpers/database";

async function createUser(name: string, email: string, pixKey?: string) {
  return prisma.user.create({
    data: {
      name,
      email,
      pixKey,
    },
  });
}

async function createPairWithMembers(userIds: string[]) {
  return prisma.pair.create({
    data: {
      name: "Casa",
      createdByUserId: userIds[0],
      members: {
        create: userIds.map((userId) => ({
          userId,
        })),
      },
    },
  });
}

describe("period repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("opens a period with the current members and blocks a second active period", async () => {
    const owner = await createUser("Titular", "owner@example.com");
    const pair = await createPairWithMembers([owner.id]);

    const period = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-16T12:00:00.000Z"),
    );
    const participants = await prisma.periodParticipant.findMany({
      where: {
        periodId: period.id,
      },
    });

    expect(period.label).toBe("16 de abril de 2026");
    expect(participants).toHaveLength(1);
    expect(participants[0]?.userId).toBe(owner.id);

    await expect(openPeriodForPair(pair.id, owner.id)).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("adds the invited second member to the active period automatically", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    const invite = await prisma.invite.create({
      data: {
        pairId: pair.id,
        createdByUserId: owner.id,
        token: "active-period-token",
        status: InviteStatus.pending,
        expiresAt: new Date("2026-04-17T12:00:00.000Z"),
      },
    });

    await expect(acceptInvite(invite.token!, guest.id)).resolves.toEqual({
      kind: "joined",
      pairId: pair.id,
    });

    const participant = await prisma.periodParticipant.findUnique({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: guest.id,
        },
      },
    });

    expect(participant).toBeTruthy();
  });

  it("blocks closing while the pair is incomplete", async () => {
    const owner = await createUser("Titular", "owner@example.com");
    const pair = await createPairWithMembers([owner.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    await expect(
      closePeriodParticipation(period.id, owner.id),
    ).rejects.toMatchObject({
      code: "PAIR_INCOMPLETE_FOR_CLOSING",
    });
  });

  it("lets the open participant manage only their own expenses until closing", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    const ownerExpense = await createExpenseForPeriod(period.id, owner.id, {
      description: "Mercado",
      amountCents: 4500,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });

    const guestExpense = await createExpenseForPeriod(period.id, guest.id, {
      description: "Farmácia",
      amountCents: 1200,
      occurredOn: new Date("2026-04-17T12:00:00.000Z"),
    });

    await updateExpenseForUser(ownerExpense.id, owner.id, {
      description: "Mercado do mês",
      amountCents: 5000,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });
    await deleteExpenseForUser(guestExpense.id, guest.id);
    await closePeriodParticipation(period.id, owner.id);

    await expect(
      updateExpenseForUser(ownerExpense.id, owner.id, {
        description: "Mercado ajustado",
        amountCents: 5100,
        occurredOn: new Date("2026-04-16T12:00:00.000Z"),
      }),
    ).rejects.toMatchObject({
      code: "PERIOD_PARTICIPANT_ALREADY_CLOSED",
    });

    await expect(
      createExpenseForPeriod(period.id, guest.id, {
        description: "Padaria",
        amountCents: 900,
        occurredOn: new Date("2026-04-18T12:00:00.000Z"),
      }),
    ).resolves.toMatchObject({
      periodId: period.id,
    });

    const refreshedPeriod = await prisma.period.findUnique({
      where: {
        id: period.id,
      },
    });

    expect(refreshedPeriod?.status).toBe(PeriodStatus.partially_closed);
  });

  it("persists the settlement result when the second participant closes", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com", "guest-pix"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    await createExpenseForPeriod(period.id, owner.id, {
      description: "Internet",
      amountCents: 1000,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });
    await createExpenseForPeriod(period.id, guest.id, {
      description: "Supermercado",
      amountCents: 7000,
      occurredOn: new Date("2026-04-17T12:00:00.000Z"),
    });

    await closePeriodParticipation(period.id, owner.id);
    await closePeriodParticipation(period.id, guest.id);

    const [refreshedPeriod, settlement] = await Promise.all([
      prisma.period.findUnique({
        where: {
          id: period.id,
        },
      }),
      prisma.settlementResult.findUnique({
        where: {
          periodId: period.id,
        },
      }),
    ]);

    expect(refreshedPeriod?.status).toBe(PeriodStatus.closed);
    expect(settlement).toMatchObject({
      totalAmountCents: 8000,
      sharePerPersonCents: 4000,
      transferAmountCents: 3000,
      payerUserId: owner.id,
      receiverUserId: guest.id,
    });
  });

  it("persists a zero settlement with no payer or receiver", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    await createExpenseForPeriod(period.id, owner.id, {
      description: "Mercado",
      amountCents: 4000,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });
    await createExpenseForPeriod(period.id, guest.id, {
      description: "Farmácia",
      amountCents: 4000,
      occurredOn: new Date("2026-04-17T12:00:00.000Z"),
    });

    await closePeriodParticipation(period.id, owner.id);
    await closePeriodParticipation(period.id, guest.id);

    const settlement = await prisma.settlementResult.findUnique({
      where: {
        periodId: period.id,
      },
    });

    expect(settlement).toMatchObject({
      totalAmountCents: 8000,
      sharePerPersonCents: 4000,
      transferAmountCents: 0,
      payerUserId: null,
      receiverUserId: null,
    });
  });

  it("reopens the latest closed period, clears the previous settlement and recalculates after a new closing", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const period = await openPeriodForPair(pair.id, owner.id);

    await createExpenseForPeriod(period.id, owner.id, {
      description: "Mercado",
      amountCents: 6000,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });
    await createExpenseForPeriod(period.id, guest.id, {
      description: "Farmácia",
      amountCents: 2000,
      occurredOn: new Date("2026-04-17T12:00:00.000Z"),
    });

    await closePeriodParticipation(period.id, owner.id);
    await closePeriodParticipation(period.id, guest.id);
    await reopenPeriod(
      period.id,
      owner.id,
      new Date("2026-04-18T12:00:00.000Z"),
    );

    const [reopenedPeriod, participantsAfterReopen, settlementAfterReopen] =
      await Promise.all([
        prisma.period.findUnique({
          where: {
            id: period.id,
          },
        }),
        prisma.periodParticipant.findMany({
          where: {
            periodId: period.id,
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
        prisma.settlementResult.findUnique({
          where: {
            periodId: period.id,
          },
        }),
      ]);

    expect(reopenedPeriod).toMatchObject({
      id: period.id,
      status: PeriodStatus.open,
      closedAt: null,
    });
    expect(reopenedPeriod?.reopenedAt?.toISOString()).toBe(
      "2026-04-18T12:00:00.000Z",
    );
    expect(
      participantsAfterReopen.map((participant) => participant.status),
    ).toEqual(["open", "open"]);
    expect(settlementAfterReopen).toBeNull();

    await createExpenseForPeriod(period.id, guest.id, {
      description: "Padaria",
      amountCents: 3000,
      occurredOn: new Date("2026-04-18T12:00:00.000Z"),
    });

    await closePeriodParticipation(period.id, owner.id);
    await closePeriodParticipation(period.id, guest.id);

    const settlementAfterRecalculation =
      await prisma.settlementResult.findUnique({
        where: {
          periodId: period.id,
        },
      });

    expect(settlementAfterRecalculation).toMatchObject({
      totalAmountCents: 11000,
      sharePerPersonCents: 5500,
      transferAmountCents: 500,
      payerUserId: guest.id,
      receiverUserId: owner.id,
    });
  });

  it("allows consulting an older closed period from the pair history", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const firstPeriod = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-01T12:00:00.000Z"),
    );

    await createExpenseForPeriod(firstPeriod.id, owner.id, {
      description: "Mercado",
      amountCents: 5000,
      occurredOn: new Date("2026-04-01T12:00:00.000Z"),
    });
    await closePeriodParticipation(firstPeriod.id, owner.id);
    await closePeriodParticipation(firstPeriod.id, guest.id);

    const secondPeriod = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-15T12:00:00.000Z"),
    );

    await createExpenseForPeriod(secondPeriod.id, guest.id, {
      description: "Internet",
      amountCents: 4000,
      occurredOn: new Date("2026-04-15T12:00:00.000Z"),
    });
    await closePeriodParticipation(secondPeriod.id, owner.id);
    await closePeriodParticipation(secondPeriod.id, guest.id);

    const historyWorkspace = await getPairPeriodWorkspace(
      pair.id,
      owner.id,
      firstPeriod.id,
    );

    expect(historyWorkspace.period).toMatchObject({
      id: firstPeriod.id,
      isHistoricalView: true,
      canReopen: false,
      settlement: {
        transferAmountCents: 2500,
      },
    });
  });

  it("only reopens the most recent closed period", async () => {
    const [owner, guest] = await Promise.all([
      createUser("Titular", "owner@example.com"),
      createUser("Convidado", "guest@example.com"),
    ]);
    const pair = await createPairWithMembers([owner.id, guest.id]);
    const firstPeriod = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-01T12:00:00.000Z"),
    );

    await closePeriodParticipation(firstPeriod.id, owner.id);
    await closePeriodParticipation(firstPeriod.id, guest.id);

    const secondPeriod = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-15T12:00:00.000Z"),
    );

    await closePeriodParticipation(secondPeriod.id, owner.id);
    await closePeriodParticipation(secondPeriod.id, guest.id);

    await expect(reopenPeriod(firstPeriod.id, owner.id)).rejects.toMatchObject({
      code: "PERIOD_REOPEN_ONLY_LATEST",
    });
  });
});
