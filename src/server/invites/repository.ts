import { randomBytes } from "node:crypto";

import {
  InviteStatus,
  PairStatus,
  Prisma,
  type Invite,
} from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import { addMemberToActivePeriod } from "@/server/periods/repository";

export const INVITE_TTL_IN_HOURS = 24;

type PairInviteBase = {
  id: string;
  token: string;
  status: InviteStatus;
  expiresAt: Date;
  createdAt: Date;
  acceptedAt: Date | null;
  acceptedByUserId: string | null;
};

export type InviteLandingSnapshot =
  | { kind: "invalid" }
  | { kind: "already_member"; pairId: string }
  | { kind: "unavailable"; pairName: string }
  | { kind: "expired"; pairName: string }
  | { kind: "revoked"; pairName: string }
  | { kind: "accepted"; pairName: string }
  | { kind: "pair_full"; pairName: string }
  | {
      kind: "pending";
      pairId: string;
      pairName: string;
      createdByName: string;
      expiresAt: Date;
    };

export type AcceptInviteResult =
  | { kind: "invalid" }
  | { kind: "already_member"; pairId: string }
  | { kind: "unavailable" }
  | { kind: "expired" }
  | { kind: "revoked" }
  | { kind: "accepted" }
  | { kind: "pair_full" }
  | { kind: "joined"; pairId: string };

function addInviteTtl(now: Date) {
  return new Date(now.getTime() + INVITE_TTL_IN_HOURS * 60 * 60 * 1000);
}

function isExpired(invite: Pick<Invite, "status" | "expiresAt">, now: Date) {
  return invite.status === InviteStatus.pending && invite.expiresAt <= now;
}

async function expireStaleInvites(
  tx: Prisma.TransactionClient | typeof prisma,
  pairId: string,
) {
  await tx.invite.updateMany({
    where: {
      pairId,
      status: InviteStatus.pending,
      expiresAt: {
        lte: new Date(),
      },
    },
    data: {
      status: InviteStatus.expired,
    },
  });
}

async function createUniqueInvite(
  tx: Prisma.TransactionClient,
  pairId: string,
  createdByUserId: string,
  now: Date,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await tx.invite.create({
        data: {
          pairId,
          createdByUserId,
          token: randomBytes(24).toString("hex"),
          expiresAt: addInviteTtl(now),
        },
        select: {
          id: true,
          token: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
          acceptedByUserId: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    "Não foi possível gerar um link de convite agora.",
    "INVITE_TOKEN_GENERATION_FAILED",
    500,
  );
}

export async function getPairInviteSnapshot(pairId: string, userId: string) {
  const membership = await prisma.pairMember.findFirst({
    where: {
      pairId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!membership) {
    throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
  }

  await expireStaleInvites(prisma, pairId);

  const latestInvite = await prisma.invite.findFirst({
    where: {
      pairId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      token: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      acceptedAt: true,
      acceptedByUserId: true,
    },
  });

  return latestInvite;
}

export async function generateInviteForPair(
  pairId: string,
  userId: string,
  now = new Date(),
) {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "pairs" WHERE id = ${pairId} FOR UPDATE`;

      const pair = await tx.pair.findFirst({
        where: {
          id: pairId,
          status: PairStatus.active,
          members: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      if (!pair) {
        throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
      }

      if (pair._count.members >= 2) {
        throw new AppError(
          "A dupla já está completa e não precisa de novo convite.",
          "PAIR_ALREADY_FULL",
          409,
        );
      }

      await expireStaleInvites(tx, pairId);

      await tx.invite.updateMany({
        where: {
          pairId,
          status: InviteStatus.pending,
        },
        data: {
          status: InviteStatus.revoked,
        },
      });

      return createUniqueInvite(tx, pairId, userId, now);
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function getInviteLandingSnapshot(
  token: string,
  userId?: string,
): Promise<InviteLandingSnapshot> {
  const now = new Date();
  const invite = await prisma.invite.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
      pairId: true,
      token: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      acceptedAt: true,
      acceptedByUserId: true,
      createdByUser: {
        select: {
          name: true,
        },
      },
      pair: {
        select: {
          id: true,
          name: true,
          status: true,
          members: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!invite) {
    return {
      kind: "invalid" as const,
    };
  }

  if (userId && invite.pair.members.some((member) => member.userId === userId)) {
    return {
      kind: "already_member" as const,
      pairId: invite.pair.id,
    };
  }

  if (invite.pair.status !== PairStatus.active) {
    return {
      kind: "unavailable" as const,
      pairName: invite.pair.name,
    };
  }

  if (isExpired(invite, now)) {
    await prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        status: InviteStatus.expired,
      },
    });

    return {
      kind: "expired" as const,
      pairName: invite.pair.name,
    };
  }

  if (invite.status === InviteStatus.revoked) {
    return {
      kind: "revoked" as const,
      pairName: invite.pair.name,
    };
  }

  if (invite.status === InviteStatus.accepted) {
    return {
      kind: "accepted" as const,
      pairName: invite.pair.name,
    };
  }

  if (invite.status === InviteStatus.expired) {
    return {
      kind: "expired" as const,
      pairName: invite.pair.name,
    };
  }

  if (invite.pair.members.length >= 2) {
    return {
      kind: "pair_full" as const,
      pairName: invite.pair.name,
    };
  }

  return {
    kind: "pending" as const,
    pairId: invite.pair.id,
    pairName: invite.pair.name,
    createdByName: invite.createdByUser.name,
    expiresAt: invite.expiresAt,
  };
}

export async function acceptInvite(
  token: string,
  userId: string,
  now = new Date(),
): Promise<AcceptInviteResult> {
  return prisma.$transaction(
    async (tx) => {
      const invite = await tx.invite.findUnique({
        where: {
          token,
        },
        select: {
          id: true,
          pairId: true,
          status: true,
          expiresAt: true,
          pair: {
            select: {
              id: true,
              status: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      if (!invite) {
        return {
          kind: "invalid" as const,
        };
      }

      if (invite.pair.members.some((member) => member.userId === userId)) {
        return {
          kind: "already_member" as const,
          pairId: invite.pairId,
        };
      }

      if (invite.pair.status !== PairStatus.active) {
        return {
          kind: "unavailable" as const,
        };
      }

      if (isExpired(invite, now)) {
        await tx.invite.update({
          where: {
            id: invite.id,
          },
          data: {
            status: InviteStatus.expired,
          },
        });

        return {
          kind: "expired" as const,
        };
      }

      if (invite.status !== InviteStatus.pending) {
        if (invite.status === InviteStatus.accepted) {
          return {
            kind: "accepted" as const,
          };
        }

        if (invite.status === InviteStatus.expired) {
          return {
            kind: "expired" as const,
          };
        }

        return {
          kind: "revoked" as const,
        };
      }

      await tx.$queryRaw`SELECT id FROM "pairs" WHERE id = ${invite.pairId} FOR UPDATE`;

      const currentMembers = await tx.pairMember.findMany({
        where: {
          pairId: invite.pairId,
        },
        select: {
          userId: true,
        },
      });

      if (currentMembers.some((member) => member.userId === userId)) {
        return {
          kind: "already_member" as const,
          pairId: invite.pairId,
        };
      }

      if (currentMembers.length >= 2) {
        await tx.invite.updateMany({
          where: {
            pairId: invite.pairId,
            status: InviteStatus.pending,
          },
          data: {
            status: InviteStatus.revoked,
          },
        });

        return {
          kind: "pair_full" as const,
        };
      }

      await tx.pairMember.create({
        data: {
          pairId: invite.pairId,
          userId,
        },
      });

      await addMemberToActivePeriod(tx, invite.pairId, userId);

      await tx.invite.update({
        where: {
          id: invite.id,
        },
        data: {
          status: InviteStatus.accepted,
          acceptedByUserId: userId,
          acceptedAt: now,
        },
      });

      await tx.invite.updateMany({
        where: {
          pairId: invite.pairId,
          status: InviteStatus.pending,
          id: {
            not: invite.id,
          },
        },
        data: {
          status: InviteStatus.revoked,
        },
      });

      return {
        kind: "joined" as const,
        pairId: invite.pairId,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export type PairInviteSnapshot = PairInviteBase | null;
