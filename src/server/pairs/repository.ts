import { PairStatus } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";

export type PairFormInput = {
  name: string;
};

export async function listUserPairs(userId: string) {
  const pairs = await prisma.pair.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      members: {
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          userId: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              pixKey: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return {
    activePairs: pairs.filter((pair) => pair.status === PairStatus.active),
    archivedPairs: pairs.filter((pair) => pair.status === PairStatus.archived),
  };
}

export async function createPairForUser(userId: string, input: PairFormInput) {
  const pair = await prisma.pair.create({
    data: {
      name: input.name.trim(),
      createdByUserId: userId,
      members: {
        create: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return pair;
}

export async function getPairDetails(pairId: string, userId: string) {
  const pair = await prisma.pair.findFirst({
    where: {
      id: pairId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      createdByUserId: true,
      members: {
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          userId: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              pixKey: true,
            },
          },
        },
      },
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

  return {
    pair,
    isIncomplete: pair._count.members < 2,
    isOwner: pair.createdByUserId === userId,
  };
}
