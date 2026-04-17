import { PairStatus, PeriodStatus, Prisma } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { formatProductDate } from "@/lib/utils";
import { prisma } from "@/server/db/client";

export type PairFormInput = {
  name: string;
};

const ACTIVE_PERIOD_STATUSES = [
  PeriodStatus.open,
  PeriodStatus.partially_closed,
] as const;

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
      archivedAt: true,
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

export async function archivePairForUser(
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
        },
      });

      if (!pair) {
        throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
      }

      const activePeriod = await tx.period.findFirst({
        where: {
          pairId,
          status: {
            in: [...ACTIVE_PERIOD_STATUSES],
          },
        },
        select: {
          id: true,
        },
      });

      if (activePeriod) {
        throw new AppError(
          "Finalize o período em andamento antes de arquivar a dupla.",
          "PAIR_ACTIVE_PERIOD_EXISTS",
          409,
        );
      }

      return tx.pair.update({
        where: {
          id: pairId,
        },
        data: {
          status: PairStatus.archived,
          archivedAt: now,
        },
        select: {
          id: true,
          status: true,
          archivedAt: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function reactivatePairForUser(pairId: string, userId: string) {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "pairs" WHERE id = ${pairId} FOR UPDATE`;

      const pair = await tx.pair.findFirst({
        where: {
          id: pairId,
          status: PairStatus.archived,
          members: {
            some: {
              userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!pair) {
        throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
      }

      return tx.pair.update({
        where: {
          id: pairId,
        },
        data: {
          status: PairStatus.active,
          archivedAt: null,
        },
        select: {
          id: true,
          status: true,
          archivedAt: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function listPairClosedPeriods(pairId: string, userId: string) {
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
      periods: {
        where: {
          status: PeriodStatus.closed,
        },
        orderBy: [{ closedAt: "desc" }, { openedAt: "desc" }],
        select: {
          id: true,
          label: true,
          openedAt: true,
          closedAt: true,
          settlement: {
            select: {
              totalAmountCents: true,
              transferAmountCents: true,
              payerUser: {
                select: {
                  name: true,
                },
              },
              receiverUser: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              expenses: true,
            },
          },
        },
      },
    },
  });

  if (!pair) {
    throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
  }

  return {
    pair: {
      id: pair.id,
      name: pair.name,
      status: pair.status,
    },
    periods: pair.periods.map((period) => ({
      id: period.id,
      label: period.label ?? formatProductDate(period.openedAt),
      openedAt: period.openedAt,
      closedAt: period.closedAt,
      expenseCount: period._count.expenses,
      settlement: period.settlement
        ? {
            totalAmountCents: period.settlement.totalAmountCents,
            transferAmountCents: period.settlement.transferAmountCents,
            payerName: period.settlement.payerUser?.name ?? null,
            receiverName: period.settlement.receiverUser?.name ?? null,
          }
        : null,
    })),
  };
}
