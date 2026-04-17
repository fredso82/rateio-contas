import {
  PairStatus,
  PeriodParticipantStatus,
  PeriodStatus,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

import { AppError } from "@/lib/errors";
import { formatProductDate } from "@/lib/utils";
import { prisma } from "@/server/db/client";
import { calculateSettlement } from "@/server/periods/settlement";

const ACTIVE_PERIOD_STATUSES = [
  PeriodStatus.open,
  PeriodStatus.partially_closed,
] as const;

type TransactionClient = Prisma.TransactionClient | PrismaClient;

export type ExpensePayload = {
  description: string;
  amountCents: number;
  occurredOn: Date;
};

function buildPeriodLabel(openedAt: Date) {
  return formatProductDate(openedAt);
}

async function getPeriodAccessSnapshot(
  tx: TransactionClient,
  periodId: string,
  userId: string,
) {
  const period = await tx.period.findFirst({
    where: {
      id: periodId,
      pair: {
        members: {
          some: {
            userId,
          },
        },
      },
    },
    select: {
      id: true,
      pairId: true,
      status: true,
      pair: {
        select: {
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
      participants: {
        where: {
          userId,
        },
        select: {
          id: true,
          userId: true,
          status: true,
        },
      },
    },
  });

  if (!period) {
    throw new AppError("Período não encontrado.", "PERIOD_NOT_FOUND", 404);
  }

  let participant = period.participants[0] ?? null;

  if (!participant && period.status !== PeriodStatus.closed) {
    participant = await tx.periodParticipant.create({
      data: {
        periodId,
        userId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
  }

  if (!participant) {
    throw new AppError(
      "Você não participa deste período.",
      "PERIOD_PARTICIPANT_NOT_FOUND",
      403,
    );
  }

  return {
    ...period,
    participant,
  };
}

async function ensureOpenParticipant(
  tx: TransactionClient,
  periodId: string,
  userId: string,
) {
  const period = await getPeriodAccessSnapshot(tx, periodId, userId);

  if (period.status === PeriodStatus.closed) {
    throw new AppError(
      "Esse período já foi fechado e não pode mais receber alterações.",
      "PERIOD_ALREADY_CLOSED",
      409,
    );
  }

  if (period.participant.status !== PeriodParticipantStatus.open) {
    throw new AppError(
      "Sua participação neste período já foi fechada.",
      "PERIOD_PARTICIPANT_ALREADY_CLOSED",
      409,
    );
  }

  return period;
}

function buildParticipantTotalMap(
  participants: { userId: string }[],
  expenses: { paidByUserId: string; amountCents: number }[],
) {
  const totals = Object.fromEntries(
    participants.map((participant) => [participant.userId, 0]),
  ) as Record<string, number>;

  for (const expense of expenses) {
    if (!(expense.paidByUserId in totals)) {
      continue;
    }

    totals[expense.paidByUserId] += expense.amountCents;
  }

  return totals;
}

export async function addMemberToActivePeriod(
  tx: Prisma.TransactionClient,
  pairId: string,
  userId: string,
) {
  const activePeriod = await tx.period.findFirst({
    where: {
      pairId,
      status: {
        in: [...ACTIVE_PERIOD_STATUSES],
      },
    },
    orderBy: {
      openedAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (!activePeriod) {
    return null;
  }

  return tx.periodParticipant.upsert({
    where: {
      periodId_userId: {
        periodId: activePeriod.id,
        userId,
      },
    },
    update: {},
    create: {
      periodId: activePeriod.id,
      userId,
    },
    select: {
      id: true,
      periodId: true,
      userId: true,
      status: true,
    },
  });
}

export async function openPeriodForPair(
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
          members: {
            orderBy: {
              joinedAt: "asc",
            },
            select: {
              userId: true,
            },
          },
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
          "Já existe um período em andamento para esta dupla.",
          "PAIR_ACTIVE_PERIOD_EXISTS",
          409,
        );
      }

      return tx.period.create({
        data: {
          pairId,
          openedByUserId: userId,
          openedAt: now,
          label: buildPeriodLabel(now),
          participants: {
            createMany: {
              data: pair.members.map((member) => ({
                userId: member.userId,
              })),
            },
          },
        },
        select: {
          id: true,
          pairId: true,
          label: true,
          status: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function createExpenseForPeriod(
  periodId: string,
  userId: string,
  input: ExpensePayload,
) {
  return prisma.$transaction(async (tx) => {
    await ensureOpenParticipant(tx, periodId, userId);

    return tx.expense.create({
      data: {
        periodId,
        paidByUserId: userId,
        description: input.description.trim(),
        amountCents: input.amountCents,
        occurredOn: input.occurredOn,
      },
      select: {
        id: true,
        periodId: true,
      },
    });
  });
}

export async function updateExpenseForUser(
  expenseId: string,
  userId: string,
  input: ExpensePayload,
) {
  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findFirst({
      where: {
        id: expenseId,
        paidByUserId: userId,
      },
      select: {
        id: true,
        periodId: true,
      },
    });

    if (!expense) {
      throw new AppError("Despesa não encontrada.", "EXPENSE_NOT_FOUND", 404);
    }

    await ensureOpenParticipant(tx, expense.periodId, userId);

    return tx.expense.update({
      where: {
        id: expense.id,
      },
      data: {
        description: input.description.trim(),
        amountCents: input.amountCents,
        occurredOn: input.occurredOn,
      },
      select: {
        id: true,
        periodId: true,
      },
    });
  });
}

export async function deleteExpenseForUser(expenseId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const expense = await tx.expense.findFirst({
      where: {
        id: expenseId,
        paidByUserId: userId,
      },
      select: {
        id: true,
        periodId: true,
      },
    });

    if (!expense) {
      throw new AppError("Despesa não encontrada.", "EXPENSE_NOT_FOUND", 404);
    }

    await ensureOpenParticipant(tx, expense.periodId, userId);

    await tx.expense.delete({
      where: {
        id: expense.id,
      },
    });

    return expense;
  });
}

export async function closePeriodParticipation(
  periodId: string,
  userId: string,
  now = new Date(),
) {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "periods" WHERE id = ${periodId} FOR UPDATE`;

      const access = await ensureOpenParticipant(tx, periodId, userId);

      if (access.pair._count.members < 2) {
        throw new AppError(
          "O fechamento só fica disponível quando a dupla estiver completa.",
          "PAIR_INCOMPLETE_FOR_CLOSING",
          409,
        );
      }

      const pairMembers = await tx.pairMember.findMany({
        where: {
          pairId: access.pairId,
        },
        select: {
          userId: true,
        },
      });

      for (const member of pairMembers) {
        await tx.periodParticipant.upsert({
          where: {
            periodId_userId: {
              periodId,
              userId: member.userId,
            },
          },
          update: {},
          create: {
            periodId,
            userId: member.userId,
          },
        });
      }

      await tx.periodParticipant.update({
        where: {
          periodId_userId: {
            periodId,
            userId,
          },
        },
        data: {
          status: PeriodParticipantStatus.closed,
          closedAt: now,
        },
      });

      const period = await tx.period.findUnique({
        where: {
          id: periodId,
        },
        select: {
          id: true,
          participants: {
            orderBy: {
              createdAt: "asc",
            },
            select: {
              userId: true,
              status: true,
            },
          },
          expenses: {
            select: {
              paidByUserId: true,
              amountCents: true,
            },
          },
        },
      });

      if (!period) {
        throw new AppError("Período não encontrado.", "PERIOD_NOT_FOUND", 404);
      }

      const everyParticipantClosed = period.participants.every(
        (participant) => participant.status === PeriodParticipantStatus.closed,
      );

      if (!everyParticipantClosed) {
        return tx.period.update({
          where: {
            id: periodId,
          },
          data: {
            status: PeriodStatus.partially_closed,
            closedAt: null,
          },
          select: {
            id: true,
            status: true,
          },
        });
      }

      const settlement = calculateSettlement(
        period.participants,
        period.expenses,
      );

      await tx.period.update({
        where: {
          id: periodId,
        },
        data: {
          status: PeriodStatus.closed,
          closedAt: now,
        },
      });

      await tx.settlementResult.upsert({
        where: {
          periodId,
        },
        update: {
          totalAmountCents: settlement.totalAmountCents,
          sharePerPersonCents: settlement.sharePerPersonCents,
          payerUserId: settlement.payerUserId,
          receiverUserId: settlement.receiverUserId,
          transferAmountCents: settlement.transferAmountCents,
          calculatedAt: now,
        },
        create: {
          periodId,
          totalAmountCents: settlement.totalAmountCents,
          sharePerPersonCents: settlement.sharePerPersonCents,
          payerUserId: settlement.payerUserId,
          receiverUserId: settlement.receiverUserId,
          transferAmountCents: settlement.transferAmountCents,
          calculatedAt: now,
        },
      });

      return {
        id: periodId,
        status: PeriodStatus.closed,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function reopenPeriod(
  periodId: string,
  userId: string,
  now = new Date(),
) {
  return prisma.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "periods" WHERE id = ${periodId} FOR UPDATE`;

      const period = await tx.period.findFirst({
        where: {
          id: periodId,
          pair: {
            status: PairStatus.active,
            members: {
              some: {
                userId,
              },
            },
          },
        },
        select: {
          id: true,
          pairId: true,
          status: true,
        },
      });

      if (!period) {
        throw new AppError("Período não encontrado.", "PERIOD_NOT_FOUND", 404);
      }

      if (period.status !== PeriodStatus.closed) {
        throw new AppError(
          "Somente períodos encerrados podem ser reabertos.",
          "PERIOD_NOT_CLOSED",
          409,
        );
      }

      const latestPeriod = await tx.period.findFirst({
        where: {
          pairId: period.pairId,
        },
        orderBy: [{ openedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
        },
      });

      if (!latestPeriod || latestPeriod.id !== periodId) {
        throw new AppError(
          "Só o período encerrado mais recente pode ser reaberto.",
          "PERIOD_REOPEN_ONLY_LATEST",
          409,
        );
      }

      await tx.settlementResult.deleteMany({
        where: {
          periodId,
        },
      });

      await tx.periodParticipant.updateMany({
        where: {
          periodId,
        },
        data: {
          status: PeriodParticipantStatus.open,
          closedAt: null,
        },
      });

      return tx.period.update({
        where: {
          id: periodId,
        },
        data: {
          status: PeriodStatus.open,
          closedAt: null,
          reopenedAt: now,
        },
        select: {
          id: true,
          status: true,
          reopenedAt: true,
        },
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export async function getPairPeriodSummary(pairId: string, userId: string) {
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
      status: true,
      _count: {
        select: {
          members: true,
        },
      },
      periods: {
        orderBy: {
          openedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          label: true,
          status: true,
          openedAt: true,
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

  const period = pair.periods[0] ?? null;

  return {
    canOpenNewPeriod:
      pair.status === PairStatus.active &&
      (!period || period.status === PeriodStatus.closed),
    latestPeriod: period
      ? {
          id: period.id,
          label: period.label ?? buildPeriodLabel(period.openedAt),
          status: period.status,
          openedAt: period.openedAt,
          expenseCount: period._count.expenses,
        }
      : null,
    isPairIncomplete: pair._count.members < 2,
  };
}

export async function getPairPeriodWorkspace(
  pairId: string,
  userId: string,
  selectedPeriodId?: string,
) {
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
      _count: {
        select: {
          members: true,
        },
      },
      members: {
        orderBy: {
          joinedAt: "asc",
        },
        select: {
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              pixKey: true,
            },
          },
        },
      },
      periods: {
        orderBy: {
          openedAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!pair) {
    throw new AppError("Dupla não encontrada.", "PAIR_NOT_FOUND", 404);
  }

  const latestPeriodMeta = pair.periods[0] ?? null;
  const periodId = selectedPeriodId ?? latestPeriodMeta?.id ?? null;

  if (!periodId) {
    return {
      pair: {
        id: pair.id,
        name: pair.name,
        status: pair.status,
        archivedAt: pair.archivedAt,
        isIncomplete: pair._count.members < 2,
        members: pair.members.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          pixKey: member.user.pixKey,
        })),
      },
      period: null,
      canOpenNewPeriod: pair.status === PairStatus.active,
    };
  }

  const selectedPeriod = await prisma.period.findFirst({
    where: {
      id: periodId,
      pairId,
    },
    select: {
      id: true,
      label: true,
      status: true,
      openedAt: true,
      closedAt: true,
      reopenedAt: true,
      participants: {
        orderBy: {
          createdAt: "asc",
        },
        select: {
          userId: true,
          status: true,
          closedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              pixKey: true,
            },
          },
        },
      },
      expenses: {
        orderBy: [{ occurredOn: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          description: true,
          amountCents: true,
          occurredOn: true,
          paidByUserId: true,
          paidByUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      settlement: {
        select: {
          id: true,
          totalAmountCents: true,
          sharePerPersonCents: true,
          transferAmountCents: true,
          payerUserId: true,
          receiverUserId: true,
          payerUser: {
            select: {
              id: true,
              name: true,
            },
          },
          receiverUser: {
            select: {
              id: true,
              name: true,
              pixKey: true,
            },
          },
        },
      },
    },
  });

  if (!selectedPeriod) {
    throw new AppError("Período não encontrado.", "PERIOD_NOT_FOUND", 404);
  }

  const isLatestPeriod = latestPeriodMeta?.id === selectedPeriod.id;

  const totalByParticipant = buildParticipantTotalMap(
    selectedPeriod.participants,
    selectedPeriod.expenses,
  );
  const viewerParticipant =
    selectedPeriod.participants.find(
      (participant) => participant.userId === userId,
    ) ?? null;

  return {
    pair: {
      id: pair.id,
      name: pair.name,
      status: pair.status,
      archivedAt: pair.archivedAt,
      isIncomplete: pair._count.members < 2,
      members: pair.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        pixKey: member.user.pixKey,
      })),
    },
    canOpenNewPeriod:
      pair.status === PairStatus.active &&
      isLatestPeriod &&
      selectedPeriod.status === PeriodStatus.closed,
    period: {
      id: selectedPeriod.id,
      label: selectedPeriod.label ?? buildPeriodLabel(selectedPeriod.openedAt),
      status: selectedPeriod.status,
      openedAt: selectedPeriod.openedAt,
      closedAt: selectedPeriod.closedAt,
      reopenedAt: selectedPeriod.reopenedAt,
      isHistoricalView: !isLatestPeriod,
      canReopen:
        pair.status === PairStatus.active &&
        isLatestPeriod &&
        selectedPeriod.status === PeriodStatus.closed,
      canCreateExpense:
        viewerParticipant?.status === PeriodParticipantStatus.open &&
        selectedPeriod.status !== PeriodStatus.closed,
      canCloseParticipation:
        viewerParticipant?.status === PeriodParticipantStatus.open &&
        selectedPeriod.status !== PeriodStatus.closed &&
        pair._count.members === 2,
      viewerParticipantStatus: viewerParticipant?.status ?? null,
      participants: selectedPeriod.participants.map((participant) => ({
        userId: participant.userId,
        name: participant.user.name,
        pixKey: participant.user.pixKey,
        status: participant.status,
        closedAt: participant.closedAt,
        totalAmountCents: totalByParticipant[participant.userId] ?? 0,
      })),
      expenses: selectedPeriod.expenses.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amountCents: expense.amountCents,
        occurredOn: expense.occurredOn,
        paidByUserId: expense.paidByUserId,
        paidByName: expense.paidByUser.name,
        isEditable:
          expense.paidByUserId === userId &&
          viewerParticipant?.status === PeriodParticipantStatus.open &&
          selectedPeriod.status !== PeriodStatus.closed,
      })),
      settlement: selectedPeriod.settlement
        ? {
            totalAmountCents: selectedPeriod.settlement.totalAmountCents,
            sharePerPersonCents: selectedPeriod.settlement.sharePerPersonCents,
            transferAmountCents: selectedPeriod.settlement.transferAmountCents,
            payerUserId: selectedPeriod.settlement.payerUserId,
            receiverUserId: selectedPeriod.settlement.receiverUserId,
            payerName: selectedPeriod.settlement.payerUser?.name ?? null,
            receiverName: selectedPeriod.settlement.receiverUser?.name ?? null,
            receiverPixKey:
              selectedPeriod.settlement.receiverUser?.pixKey ?? null,
          }
        : null,
    },
  };
}

export async function getExpenseEditorSnapshot(
  pairId: string,
  expenseId: string,
  userId: string,
) {
  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      paidByUserId: userId,
      period: {
        pairId,
        pair: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
      description: true,
      amountCents: true,
      occurredOn: true,
      period: {
        select: {
          id: true,
          label: true,
          openedAt: true,
          status: true,
          pair: {
            select: {
              name: true,
            },
          },
          participants: {
            where: {
              userId,
            },
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  if (!expense) {
    throw new AppError("Despesa não encontrada.", "EXPENSE_NOT_FOUND", 404);
  }

  return {
    expense: {
      id: expense.id,
      description: expense.description,
      amountCents: expense.amountCents,
      occurredOn: expense.occurredOn,
      canEdit:
        expense.period.status !== PeriodStatus.closed &&
        expense.period.participants[0]?.status === PeriodParticipantStatus.open,
    },
    pairName: expense.period.pair.name,
    periodId: expense.period.id,
    periodLabel:
      expense.period.label ?? buildPeriodLabel(expense.period.openedAt),
  };
}
