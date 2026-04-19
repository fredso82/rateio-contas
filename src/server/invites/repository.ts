import { randomBytes } from "node:crypto";

import {
  InviteStatus,
  PairStatus,
  Prisma,
  type Invite,
} from "@prisma/client";

import { decryptOpaqueToken, encryptOpaqueToken, hashOpaqueToken } from "@/lib/crypto";
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

function buildStoredInviteToken(token: string) {
  return {
    tokenHash: hashOpaqueToken(token),
    tokenCiphertext: encryptOpaqueToken(token),
  };
}

function getInviteTokenOrThrow(invite: {
  id: string;
  token: string | null;
  tokenCiphertext: string | null;
}) {
  if (invite.tokenCiphertext) {
    return decryptOpaqueToken(invite.tokenCiphertext);
  }

  if (invite.token) {
    return invite.token;
  }

  throw new AppError(
    "Não foi possível recuperar o link de convite atual.",
    "INVITE_TOKEN_UNAVAILABLE",
    500,
  );
}

async function findInviteByToken(
  tx: Prisma.TransactionClient | typeof prisma,
  token: string,
) {
  const tokenHash = hashOpaqueToken(token);

  return tx.invite.findFirst({
    where: {
      OR: [
        {
          tokenHash,
        },
        {
          token,
        },
      ],
    },
  });
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
    const token = randomBytes(24).toString("hex");
    const storedToken = buildStoredInviteToken(token);

    try {
      const invite = await tx.invite.create({
        data: {
          pairId,
          createdByUserId,
          token: null,
          tokenHash: storedToken.tokenHash,
          tokenCiphertext: storedToken.tokenCiphertext,
          expiresAt: addInviteTtl(now),
        },
        select: {
          id: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
          acceptedByUserId: true,
        },
      });

      return {
        ...invite,
        token,
      };
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
      tokenCiphertext: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      acceptedAt: true,
      acceptedByUserId: true,
    },
  });

  if (!latestInvite) {
    return null;
  }

  return {
    ...latestInvite,
    token: getInviteTokenOrThrow(latestInvite),
  };
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
  const invite = await findInviteByToken(prisma, token);

  if (!invite) {
    return {
      kind: "invalid" as const,
    };
  }

  const expandedInvite = await prisma.invite.findUnique({
    where: {
      id: invite.id,
    },
    select: {
      id: true,
      pairId: true,
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

  if (!expandedInvite) {
    return {
      kind: "invalid" as const,
    };
  }

  if (
    userId &&
    expandedInvite.pair.members.some((member) => member.userId === userId)
  ) {
    return {
      kind: "already_member" as const,
      pairId: expandedInvite.pair.id,
    };
  }

  if (expandedInvite.pair.status !== PairStatus.active) {
    return {
      kind: "unavailable" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  if (isExpired(expandedInvite, now)) {
    await prisma.invite.update({
      where: {
        id: expandedInvite.id,
      },
      data: {
        status: InviteStatus.expired,
      },
    });

    return {
      kind: "expired" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  if (expandedInvite.status === InviteStatus.revoked) {
    return {
      kind: "revoked" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  if (expandedInvite.status === InviteStatus.accepted) {
    return {
      kind: "accepted" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  if (expandedInvite.status === InviteStatus.expired) {
    return {
      kind: "expired" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  if (expandedInvite.pair.members.length >= 2) {
    return {
      kind: "pair_full" as const,
      pairName: expandedInvite.pair.name,
    };
  }

  return {
    kind: "pending" as const,
    pairId: expandedInvite.pair.id,
    pairName: expandedInvite.pair.name,
    createdByName: expandedInvite.createdByUser.name,
    expiresAt: expandedInvite.expiresAt,
  };
}

export async function acceptInvite(
  token: string,
  userId: string,
  now = new Date(),
): Promise<AcceptInviteResult> {
  return prisma.$transaction(
    async (tx) => {
      const invite = await findInviteByToken(tx, token);

      if (!invite) {
        return {
          kind: "invalid" as const,
        };
      }

      const expandedInvite = await tx.invite.findUnique({
        where: {
          id: invite.id,
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

      if (!expandedInvite) {
        return {
          kind: "invalid" as const,
        };
      }

      if (expandedInvite.pair.members.some((member) => member.userId === userId)) {
        return {
          kind: "already_member" as const,
          pairId: expandedInvite.pairId,
        };
      }

      if (expandedInvite.pair.status !== PairStatus.active) {
        return {
          kind: "unavailable" as const,
        };
      }

      if (isExpired(expandedInvite, now)) {
        await tx.invite.update({
          where: {
            id: expandedInvite.id,
          },
          data: {
            status: InviteStatus.expired,
          },
        });

        return {
          kind: "expired" as const,
        };
      }

      if (expandedInvite.status !== InviteStatus.pending) {
        if (expandedInvite.status === InviteStatus.accepted) {
          return {
            kind: "accepted" as const,
          };
        }

        if (expandedInvite.status === InviteStatus.expired) {
          return {
            kind: "expired" as const,
          };
        }

        return {
          kind: "revoked" as const,
        };
      }

      await tx.$queryRaw`SELECT id FROM "pairs" WHERE id = ${expandedInvite.pairId} FOR UPDATE`;

      const currentMembers = await tx.pairMember.findMany({
        where: {
          pairId: expandedInvite.pairId,
        },
        select: {
          userId: true,
        },
      });

      if (currentMembers.some((member) => member.userId === userId)) {
        return {
          kind: "already_member" as const,
          pairId: expandedInvite.pairId,
        };
      }

      if (currentMembers.length >= 2) {
        await tx.invite.updateMany({
          where: {
            pairId: expandedInvite.pairId,
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
          pairId: expandedInvite.pairId,
          userId,
        },
      });

      await addMemberToActivePeriod(tx, expandedInvite.pairId, userId);

      await tx.invite.update({
        where: {
          id: expandedInvite.id,
        },
        data: {
          status: InviteStatus.accepted,
          acceptedByUserId: userId,
          acceptedAt: now,
        },
      });

      await tx.invite.updateMany({
        where: {
          pairId: expandedInvite.pairId,
          status: InviteStatus.pending,
          id: {
            not: expandedInvite.id,
          },
        },
        data: {
          status: InviteStatus.revoked,
        },
      });

      return {
        kind: "joined" as const,
        pairId: expandedInvite.pairId,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export type PairInviteSnapshot = PairInviteBase | null;
