import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { PairStatus, PeriodStatus } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import {
  archivePairForUser,
  createPairForUser,
  getPairDetails,
  listPairClosedPeriods,
  listUserPairs,
  reactivatePairForUser,
} from "@/server/pairs/repository";
import {
  closePeriodParticipation,
  createExpenseForPeriod,
  openPeriodForPair,
} from "@/server/periods/repository";
import { resetDatabase } from "@/test/helpers/database";

describe("pair repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("creates a pair and includes the creator as first member", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "pairs@example.com",
      },
    });

    const pair = await createPairForUser(user.id, {
      name: "Casa",
    });

    const membership = await prisma.pairMember.findFirst({
      where: {
        pairId: pair.id,
        userId: user.id,
      },
    });

    expect(pair.name).toBe("Casa");
    expect(membership).toBeTruthy();
  });

  it("lists active and archived pairs separately", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "pairs@example.com",
      },
    });

    const [activePair, archivedPair] = await Promise.all([
      prisma.pair.create({
        data: {
          name: "Ativa",
          createdByUserId: user.id,
          status: PairStatus.active,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
      }),
      prisma.pair.create({
        data: {
          name: "Arquivada",
          createdByUserId: user.id,
          status: PairStatus.archived,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
      }),
    ]);

    const result = await listUserPairs(user.id);

    expect(result.activePairs.map((pair) => pair.id)).toContain(activePair.id);
    expect(result.archivedPairs.map((pair) => pair.id)).toContain(
      archivedPair.id,
    );
  });

  it("returns pair details only for members", async () => {
    const [owner, stranger] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Titular",
          email: "owner@example.com",
        },
      }),
      prisma.user.create({
        data: {
          name: "Visitante",
          email: "visitor@example.com",
        },
      }),
    ]);

    const pair = await prisma.pair.create({
      data: {
        name: "Casa",
        createdByUserId: owner.id,
        members: {
          create: {
            userId: owner.id,
          },
        },
      },
    });

    await expect(getPairDetails(pair.id, owner.id)).resolves.toMatchObject({
      pair: {
        id: pair.id,
        name: "Casa",
      },
      isIncomplete: true,
      isOwner: true,
    });

    await expect(getPairDetails(pair.id, stranger.id)).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("archives and reactivates a pair without losing memberships", async () => {
    const [owner, guest] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Titular",
          email: "owner@example.com",
        },
      }),
      prisma.user.create({
        data: {
          name: "Convidado",
          email: "guest@example.com",
        },
      }),
    ]);

    const pair = await prisma.pair.create({
      data: {
        name: "Casa",
        createdByUserId: owner.id,
        members: {
          create: [{ userId: owner.id }, { userId: guest.id }],
        },
      },
    });

    await archivePairForUser(
      pair.id,
      owner.id,
      new Date("2026-04-16T12:00:00.000Z"),
    );

    const pairAfterArchive = await prisma.pair.findUnique({
      where: {
        id: pair.id,
      },
      include: {
        members: true,
      },
    });

    expect(pairAfterArchive).toMatchObject({
      id: pair.id,
      status: PairStatus.archived,
    });
    expect(pairAfterArchive?.archivedAt?.toISOString()).toBe(
      "2026-04-16T12:00:00.000Z",
    );
    expect(pairAfterArchive?.members).toHaveLength(2);

    await reactivatePairForUser(pair.id, owner.id);

    const reactivatedPair = await prisma.pair.findUnique({
      where: {
        id: pair.id,
      },
    });

    expect(reactivatedPair).toMatchObject({
      id: pair.id,
      status: PairStatus.active,
      archivedAt: null,
    });
  });

  it("blocks archiving when there is an active period in progress", async () => {
    const owner = await prisma.user.create({
      data: {
        name: "Titular",
        email: "owner@example.com",
      },
    });
    const pair = await prisma.pair.create({
      data: {
        name: "Casa",
        createdByUserId: owner.id,
        members: {
          create: {
            userId: owner.id,
          },
        },
      },
    });

    await openPeriodForPair(pair.id, owner.id);

    await expect(archivePairForUser(pair.id, owner.id)).rejects.toMatchObject({
      code: "PAIR_ACTIVE_PERIOD_EXISTS",
    });
  });

  it("lists closed periods for the pair history", async () => {
    const [owner, guest] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Titular",
          email: "owner@example.com",
        },
      }),
      prisma.user.create({
        data: {
          name: "Convidado",
          email: "guest@example.com",
        },
      }),
    ]);
    const pair = await prisma.pair.create({
      data: {
        name: "Casa",
        createdByUserId: owner.id,
        members: {
          create: [{ userId: owner.id }, { userId: guest.id }],
        },
      },
    });
    const period = await openPeriodForPair(
      pair.id,
      owner.id,
      new Date("2026-04-16T12:00:00.000Z"),
    );

    await createExpenseForPeriod(period.id, owner.id, {
      description: "Mercado",
      amountCents: 9000,
      occurredOn: new Date("2026-04-16T12:00:00.000Z"),
    });
    await closePeriodParticipation(period.id, owner.id);
    await closePeriodParticipation(period.id, guest.id);

    const history = await listPairClosedPeriods(pair.id, owner.id);

    expect(history.pair).toMatchObject({
      id: pair.id,
      status: PairStatus.active,
    });
    expect(history.periods).toHaveLength(1);
    expect(history.periods[0]).toMatchObject({
      id: period.id,
      expenseCount: 1,
      settlement: {
        transferAmountCents: 4500,
        payerName: "Convidado",
        receiverName: "Titular",
      },
    });

    const closedPeriod = await prisma.period.findUnique({
      where: {
        id: period.id,
      },
    });

    expect(closedPeriod?.status).toBe(PeriodStatus.closed);
  });
});
