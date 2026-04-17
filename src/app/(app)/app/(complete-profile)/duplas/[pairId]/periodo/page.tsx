import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  Lock,
  PencilLine,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";

import { auth } from "@/auth";
import { PixKeyCopyButton } from "@/components/periods/pix-key-copy-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  closeViewerPeriodParticipation,
  deletePeriodExpense,
  openPairPeriod,
} from "@/server/periods/actions";
import { getPairPeriodWorkspace } from "@/server/periods/repository";
import {
  formatCurrencyFromCents,
  formatProductDate,
  formatProductDateTime,
} from "@/lib/utils";

type PairPeriodPageProps = {
  params: Promise<{
    pairId: string;
  }>;
};

function getPeriodStatusText(status: "open" | "partially_closed" | "closed") {
  switch (status) {
    case "open":
      return "Período aberto";
    case "partially_closed":
      return "Parcialmente fechado";
    case "closed":
      return "Período fechado";
  }
}

export default async function PairPeriodPage({ params }: PairPeriodPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { pairId } = await params;
  const { pair, period, canOpenNewPeriod } = await getPairPeriodWorkspace(
    pairId,
    session.user.id,
  );

  if (!period) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost">
          <Link href={`/app/duplas/${pairId}`}>
            <ArrowLeft className="size-4" />
            Voltar para a dupla
          </Link>
        </Button>

        <Card className="p-8" variant="accent">
          <p className="eyebrow text-xs font-semibold text-brand">Períodos</p>
          <h1 className="font-display mt-5 text-5xl leading-none">
            Nenhum período foi aberto ainda.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Abra o primeiro período para começar a lançar despesas. Se a dupla
            ainda estiver incompleta, tudo bem: o fechamento continua bloqueado
            até a segunda pessoa entrar.
          </p>

          <form action={openPairPeriod} className="mt-8">
            <input name="pairId" type="hidden" value={pairId} />
            <Button size="lg" type="submit">
              Abrir primeiro período
              <Plus className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  const settlement = period.settlement;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost">
          <Link href={`/app/duplas/${pairId}`}>
            <ArrowLeft className="size-4" />
            Voltar para a dupla
          </Link>
        </Button>

        {canOpenNewPeriod ? (
          <form action={openPairPeriod}>
            <input name="pairId" type="hidden" value={pairId} />
            <Button type="submit" variant="secondary">
              Abrir novo período
              <Plus className="size-4" />
            </Button>
          </form>
        ) : null}
      </div>

      <Card className="overflow-hidden p-7 sm:p-8" variant="accent">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-xs font-semibold text-brand">
              {pair.name}
            </p>
            <h1 className="font-display mt-5 text-5xl leading-none">
              {period.label}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              {period.status === "open"
                ? "Período pronto para receber lançamentos dos gastos do dia a dia."
                : period.status === "partially_closed"
                  ? "Uma pessoa já fechou a participação. A outra ainda pode ajustar as próprias despesas."
                  : "Período encerrado com resultado persistido para consulta rápida."}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-muted sm:text-right">
            <div>
              <p className="font-semibold text-foreground">
                {getPeriodStatusText(period.status)}
              </p>
              <p>Aberto em {formatProductDateTime(period.openedAt)}</p>
            </div>
            {period.closedAt ? (
              <div>
                <p className="font-semibold text-foreground">Fechamento final</p>
                <p>{formatProductDateTime(period.closedAt)}</p>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Despesas do período
                </p>
                <p className="mt-2 text-sm text-muted">
                  As despesas sempre ficam vinculadas a quem lançou cada gasto.
                </p>
              </div>

              {period.canCreateExpense ? (
                <Button asChild>
                  <Link href={`/app/duplas/${pairId}/periodo/despesas/nova`}>
                    Nova despesa
                    <Plus className="size-4" />
                  </Link>
                </Button>
              ) : null}
            </div>

            {period.expenses.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-line-strong bg-white/60 p-4 text-sm text-muted">
                Ainda não há despesas lançadas neste período.
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {period.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {expense.description}
                        </p>
                        <p className="mt-1 text-sm text-muted">
                          {expense.paidByName} · {formatProductDate(expense.occurredOn)}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 sm:items-end">
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrencyFromCents(expense.amountCents)}
                        </p>

                        {expense.isEditable ? (
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="secondary">
                              <Link
                                href={`/app/duplas/${pairId}/periodo/despesas/${expense.id}/editar`}
                              >
                                <PencilLine className="size-4" />
                                Editar
                              </Link>
                            </Button>

                            <form action={deletePeriodExpense}>
                              <input name="pairId" type="hidden" value={pairId} />
                              <input
                                name="expenseId"
                                type="hidden"
                                value={expense.id}
                              />
                              <Button size="sm" type="submit" variant="danger">
                                <Trash2 className="size-4" />
                                Excluir
                              </Button>
                            </form>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <WalletCards className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">Resumo parcial</h2>
                <p className="mt-1 text-sm text-muted">
                  Totais acumulados por participante neste período.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {period.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {participant.name}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {participant.status === "open"
                          ? "Participação aberta"
                          : participant.closedAt
                            ? `Fechou em ${formatProductDateTime(participant.closedAt)}`
                            : "Participação fechada"}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrencyFromCents(participant.totalAmountCents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" variant="soft">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-white/80 text-brand">
                {period.status === "closed" ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Lock className="size-5" />
                )}
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Fechamento
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {period.viewerParticipantStatus === "closed"
                    ? "Sua participação neste período já está fechada."
                    : pair.isIncomplete
                      ? "O fechamento fica liberado só depois que a dupla estiver completa."
                      : "Feche sua participação quando terminar de revisar as próprias despesas."}
                </p>
              </div>
            </div>

            {period.canCloseParticipation ? (
              <form action={closeViewerPeriodParticipation} className="mt-5">
                <input name="pairId" type="hidden" value={pairId} />
                <input name="periodId" type="hidden" value={period.id} />
                <Button fullWidth type="submit">
                  Fechar minha participação
                  <CheckCircle2 className="size-4" />
                </Button>
              </form>
            ) : period.viewerParticipantStatus === "open" &&
              period.status !== "closed" ? (
              <div className="mt-5">
                <Button disabled fullWidth type="button">
                  Fechar minha participação
                  <Lock className="size-4" />
                </Button>
              </div>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <CalendarRange className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">Resultado</h2>
                <p className="mt-1 text-sm text-muted">
                  O cálculo final aparece automaticamente quando as duas pessoas
                  fecham o período.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
              {settlement ? (
                settlement.transferAmountCents === 0 ? (
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Ninguém deve nada.
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      O total do período ficou equilibrado entre as duas pessoas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        {settlement.payerName} paga{" "}
                        {formatCurrencyFromCents(settlement.transferAmountCents)} para{" "}
                        {settlement.receiverName}.
                      </p>
                      <p className="mt-2 text-sm text-muted">
                        Total do período:{" "}
                        {formatCurrencyFromCents(settlement.totalAmountCents)}.
                      </p>
                    </div>

                    {settlement.receiverPixKey ? (
                      <div className="rounded-[1.25rem] border border-line bg-background/75 p-4">
                        <p className="text-sm font-semibold text-foreground">
                          Chave Pix de {settlement.receiverName}
                        </p>
                        <p className="mt-2 font-mono text-sm break-all text-muted">
                          {settlement.receiverPixKey}
                        </p>
                        <div className="mt-4">
                          <PixKeyCopyButton pixKey={settlement.receiverPixKey} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted">
                        {settlement.receiverName} ainda não cadastrou uma chave Pix.
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm text-muted">
                  O resultado final será persistido assim que as duas
                  participações forem fechadas.
                </p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
