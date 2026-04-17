import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { InviteStatus } from "@prisma/client";

import { prisma } from "@/server/db/client";
import {
  INVITE_TTL_IN_HOURS,
  acceptInvite,
  generateInviteForPair,
  getInviteLandingSnapshot,
  getPairInviteSnapshot,
} from "@/server/invites/repository";
import { resetDatabase } from "@/test/helpers/database";

describe("invite repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("generates a pending invite with 24h validity and revokes the previous one", async () => {
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

    const firstNow = new Date("2026-04-16T12:00:00.000Z");
    const secondNow = new Date("2026-04-16T13:00:00.000Z");

    const firstInvite = await generateInviteForPair(pair.id, owner.id, firstNow);
    const secondInvite = await generateInviteForPair(
      pair.id,
      owner.id,
      secondNow,
    );

    const refreshedFirstInvite = await prisma.invite.findUnique({
      where: {
        id: firstInvite.id,
      },
    });

    expect(secondInvite.status).toBe(InviteStatus.pending);
    expect(secondInvite.expiresAt.toISOString()).toBe(
      new Date(
        secondNow.getTime() + INVITE_TTL_IN_HOURS * 60 * 60 * 1000,
      ).toISOString(),
    );
    expect(refreshedFirstInvite?.status).toBe(InviteStatus.revoked);
  });

  it("returns an expired landing snapshot and persists the expired status", async () => {
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

    const invite = await prisma.invite.create({
      data: {
        pairId: pair.id,
        createdByUserId: owner.id,
        token: "expired-token",
        expiresAt: new Date("2026-04-15T12:00:00.000Z"),
      },
    });

    const snapshot = await getInviteLandingSnapshot(invite.token);
    const refreshedInvite = await prisma.invite.findUnique({
      where: {
        id: invite.id,
      },
    });

    expect(snapshot).toEqual({
      kind: "expired",
      pairName: "Casa",
    });
    expect(refreshedInvite?.status).toBe(InviteStatus.expired);
  });

  it("accepts a valid invite, links the second member and revokes sibling pending invites", async () => {
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
          create: {
            userId: owner.id,
          },
        },
      },
    });

    const invite = await prisma.invite.create({
      data: {
        pairId: pair.id,
        createdByUserId: owner.id,
        token: "valid-token",
        expiresAt: new Date("2026-04-17T12:00:00.000Z"),
      },
    });

    const siblingInvite = await prisma.invite.create({
      data: {
        pairId: pair.id,
        createdByUserId: owner.id,
        token: "sibling-token",
        expiresAt: new Date("2026-04-17T12:00:00.000Z"),
      },
    });

    const result = await acceptInvite(invite.token, guest.id);
    const membership = await prisma.pairMember.findFirst({
      where: {
        pairId: pair.id,
        userId: guest.id,
      },
    });
    const acceptedInvite = await prisma.invite.findUnique({
      where: {
        id: invite.id,
      },
    });
    const revokedSibling = await prisma.invite.findUnique({
      where: {
        id: siblingInvite.id,
      },
    });

    expect(result).toEqual({
      kind: "joined",
      pairId: pair.id,
    });
    expect(membership).toBeTruthy();
    expect(acceptedInvite?.status).toBe(InviteStatus.accepted);
    expect(acceptedInvite?.acceptedByUserId).toBe(guest.id);
    expect(revokedSibling?.status).toBe(InviteStatus.revoked);
  });

  it("returns the current invite snapshot for pair members", async () => {
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

    const invite = await prisma.invite.create({
      data: {
        pairId: pair.id,
        createdByUserId: owner.id,
        token: "snapshot-token",
        expiresAt: new Date("2026-04-17T12:00:00.000Z"),
      },
    });

    await expect(getPairInviteSnapshot(pair.id, owner.id)).resolves.toMatchObject(
      {
        id: invite.id,
        token: invite.token,
        status: InviteStatus.pending,
      },
    );
  });
});
