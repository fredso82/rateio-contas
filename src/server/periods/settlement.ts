export type SettlementParticipantInput = {
  userId: string;
};

export type SettlementExpenseInput = {
  paidByUserId: string;
  amountCents: number;
};

export type SettlementComputation = {
  totalAmountCents: number;
  sharePerPersonCents: number;
  transferAmountCents: number;
  payerUserId: string | null;
  receiverUserId: string | null;
  perParticipantTotals: Record<string, number>;
};

export function calculateSettlement(
  participants: SettlementParticipantInput[],
  expenses: SettlementExpenseInput[],
): SettlementComputation {
  if (participants.length !== 2) {
    throw new Error("O cálculo de acerto exige exatamente dois participantes.");
  }

  const totals = Object.fromEntries(
    participants.map((participant) => [participant.userId, 0]),
  ) as Record<string, number>;

  for (const expense of expenses) {
    if (!(expense.paidByUserId in totals)) {
      throw new Error("Despesa encontrada para um usuário fora do período.");
    }

    totals[expense.paidByUserId] += expense.amountCents;
  }

  const totalAmountCents = Object.values(totals).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const sharePerPersonCents = Math.floor(totalAmountCents / participants.length);
  const remainderCents = totalAmountCents % participants.length;
  const dueAmounts = Object.fromEntries(
    participants.map((participant) => [
      participant.userId,
      sharePerPersonCents,
    ]),
  ) as Record<string, number>;

  const participantsByLowestContribution = [...participants].sort(
    (left, right) => totals[left.userId] - totals[right.userId],
  );

  for (let index = 0; index < remainderCents; index += 1) {
    dueAmounts[participantsByLowestContribution[index].userId] += 1;
  }

  const balances = participants.map((participant) => ({
    userId: participant.userId,
    balanceCents: totals[participant.userId] - dueAmounts[participant.userId],
  }));
  const payer = balances.find((balance) => balance.balanceCents < 0) ?? null;
  const receiver = balances.find((balance) => balance.balanceCents > 0) ?? null;

  if (!payer || !receiver) {
    return {
      totalAmountCents,
      sharePerPersonCents,
      transferAmountCents: 0,
      payerUserId: null,
      receiverUserId: null,
      perParticipantTotals: totals,
    };
  }

  return {
    totalAmountCents,
    sharePerPersonCents,
    transferAmountCents: Math.abs(payer.balanceCents),
    payerUserId: payer.userId,
    receiverUserId: receiver.userId,
    perParticipantTotals: totals,
  };
}
