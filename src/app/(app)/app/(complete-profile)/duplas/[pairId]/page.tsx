import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  BadgeCheck,
  Clock3,
  History,
  Link2,
  Lock,
  Plus,
  RefreshCcw,
  UserRoundPlus,
} from "lucide-react";

import { auth } from "@/auth";
import { InviteLinkCard } from "@/components/pairs/invite-link-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { getPairInviteSnapshot } from "@/server/invites/repository";
import {
  archiveViewerPair,
  generatePairInvite,
  reactivateViewerPair,
} from "@/server/pairs/actions";
import {
  getPairDetails,
  listPairClosedPeriods,
} from "@/server/pairs/repository";
import { openPairPeriod } from "@/server/periods/actions";
import { getPairPeriodSummary } from "@/server/periods/repository";
import { formatCurrencyFromCents, formatProductDateTime } from "@/lib/utils";

type PairDetailPageProps = {
  params: Promise<{
    pairId: string;
  }>;
};

export default async function PairDetailPage({ params }: PairDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { pairId } = await params;
  const [{ pair, isIncomplete }, latestInvite, periodSummary, historySnapshot] =
    await Promise.all([
      getPairDetails(pairId, session.user.id),
      getPairInviteSnapshot(pairId, session.user.id),
      getPairPeriodSummary(pairId, session.user.id),
      listPairClosedPeriods(pairId, session.user.id),
    ]);

  const isArchived = pair.status === "archived";
  const hasActiveInvite =
    latestInvite?.status === "pending" && latestInvite.expiresAt > new Date();
  const canArchive =
    !isArchived &&
    (!periodSummary.latestPeriod ||
      periodSummary.latestPeriod.status === "closed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost">
          <Link href={isArchived ? "/app/duplas/arquivadas" : "/app/duplas"}>
            <ArrowLeft className="size-4" />
            {isArchived ? "Voltar para arquivadas" : "Voltar para duplas"}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden p-7 sm:p-8" variant="accent">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
              {isArchived ? (
                <Archive className="size-3.5" />
              ) : (
                <BadgeCheck className="size-3.5 text-success" />
              )}
              {isArchived ? "Dupla arquivada" : "Dupla ativa"}
            </div>
            <h1 className="font-display mt-5 text-5xl leading-none">
              {pair.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              {isArchived
                ? "Esta dupla foi organizada no histórico. Os dados continuam preservados para consulta e podem ser reativados quando vocês quiserem voltar a usar."
                : isIncomplete
                  ? "Você já pode preparar a dupla e mandar o convite. Quando a segunda pessoa entrar, o vínculo fica completo."
                  : "As duas pessoas já estão dentro da dupla. O fluxo principal de rateio já pode acontecer sem bloqueios de cadastro."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {!isArchived && isIncomplete ? (
              <form action={generatePairInvite}>
                <input name="pairId" type="hidden" value={pair.id} />
                <Button size="lg" type="submit">
                  {hasActiveInvite
                    ? "Gerar novo link"
                    : "Gerar link de convite"}
                  <Plus className="size-4" />
                </Button>
              </form>
            ) : null}

            {isArchived ? (
              <Modal
                description="A dupla volta para a lista principal sem perder histórico nem membros."
                title="Reativar dupla?"
                trigger={
                  <Button size="lg" variant="secondary">
                    Reativar dupla
                    <RefreshCcw className="size-4" />
                  </Button>
                }
              >
                <form action={reactivateViewerPair} className="space-y-4">
                  <input name="pairId" type="hidden" value={pair.id} />
                  <p className="text-sm text-muted">
                    Ao reativar, vocês podem abrir novos períodos normalmente.
                  </p>
                  <Button fullWidth type="submit">
                    Confirmar reativação
                    <RefreshCcw className="size-4" />
                  </Button>
                </form>
              </Modal>
            ) : (
              <Modal
                description="O histórico continua intacto, mas a dupla sai da lista principal até ser reativada."
                title="Arquivar dupla?"
                trigger={
                  <Button disabled={!canArchive} size="lg" variant="secondary">
                    Arquivar dupla
                    <Archive className="size-4" />
                  </Button>
                }
              >
                <form action={archiveViewerPair} className="space-y-4">
                  <input name="pairId" type="hidden" value={pair.id} />
                  <p className="text-sm text-muted">
                    Só permitimos arquivar quando não existe período em
                    andamento.
                  </p>
                  <Button fullWidth type="submit" variant="danger">
                    Confirmar arquivamento
                    <Archive className="size-4" />
                  </Button>
                </form>
              </Modal>
            )}
          </div>
        </div>

        {!canArchive && !isArchived ? (
          <div className="mt-6 rounded-[1.5rem] border border-line-strong bg-white/70 p-4 text-sm text-muted">
            Existe um período em andamento nesta dupla. Finalize ou reabra o
            fluxo corretamente antes de arquivar.
          </div>
        ) : null}
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold text-foreground">
            Quem está na dupla
          </p>
          <div className="mt-4 space-y-3">
            {pair.members.map((member) => (
              <div
                key={member.user.id}
                className="flex items-center justify-between rounded-[1.5rem] border border-line-strong bg-white/75 p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {member.user.name}
                  </p>
                  <p className="text-sm text-muted">{member.user.email}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
                  <BadgeCheck className="size-3.5 text-success" />
                  Membro ativo
                </div>
              </div>
            ))}

            {isIncomplete ? (
              <div className="flex items-center gap-3 rounded-[1.5rem] border border-dashed border-line-strong bg-white/60 p-4 text-muted">
                <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                  <UserRoundPlus className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Falta a segunda pessoa
                  </p>
                  <p className="text-sm">
                    Gere um convite para completar a dupla.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card variant="soft">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <Clock3 className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Estado atual
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {isArchived
                    ? "Dupla fora da lista principal, disponível para consulta e reativação."
                    : isIncomplete
                      ? "Dupla incompleta, pronta para receber convite."
                      : "Dupla completa e estável."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Período atual
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {periodSummary.latestPeriod
                    ? `${periodSummary.latestPeriod.label} · ${periodSummary.latestPeriod.expenseCount} despesa(s).`
                    : "Ainda não existe nenhum período de rateio para esta dupla."}
                </p>
              </div>

              {periodSummary.latestPeriod ? (
                <Button asChild variant="secondary">
                  <Link href={`/app/duplas/${pair.id}/periodo`}>
                    Ver período
                    <ArrowLeft className="size-4 rotate-180" />
                  </Link>
                </Button>
              ) : null}
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-line-strong bg-white/75 p-4 text-sm text-muted">
              {isArchived
                ? "A dupla está arquivada, então o histórico segue disponível, mas novos ciclos ficam bloqueados até a reativação."
                : periodSummary.latestPeriod
                  ? periodSummary.latestPeriod.status === "closed"
                    ? "O último período já foi encerrado. Você pode abrir um novo ciclo quando quiser."
                    : periodSummary.latestPeriod.status === "partially_closed"
                      ? "Existe um período parcialmente fechado. Só um novo período poderá ser aberto depois do fechamento final."
                      : "Existe um período aberto agora. A segunda pessoa entra nele automaticamente se aceitar o convite neste momento."
                  : isIncomplete
                    ? "Você já pode abrir o primeiro período mesmo antes da dupla ficar completa."
                    : "Abra o primeiro período para começar os lançamentos desta dupla."}
            </div>

            {periodSummary.canOpenNewPeriod ? (
              <form action={openPairPeriod} className="mt-5">
                <input name="pairId" type="hidden" value={pair.id} />
                <Button type="submit">
                  {periodSummary.latestPeriod
                    ? "Abrir novo período"
                    : "Abrir primeiro período"}
                  <Plus className="size-4" />
                </Button>
              </form>
            ) : null}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <Link2 className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">Convite</h2>
                <p className="mt-1 text-sm text-muted">
                  {isArchived
                    ? "Convites ficam indisponíveis enquanto a dupla estiver arquivada."
                    : isIncomplete
                      ? "Gere ou regenere um link compartilhável de 24 horas."
                      : "A dupla já está completa, então nenhum novo convite é necessário."}
                </p>
              </div>
            </div>

            <div className="mt-5">
              {!isArchived && hasActiveInvite && latestInvite ? (
                <InviteLinkCard
                  expiresAt={latestInvite.expiresAt.toISOString()}
                  token={latestInvite.token}
                />
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-line-strong bg-white/60 p-4 text-sm text-muted">
                  {isArchived
                    ? "Reative a dupla para voltar a compartilhar links."
                    : isIncomplete
                      ? "Ainda não existe um convite ativo para esta dupla."
                      : "Convites antigos deixam de ser relevantes quando a dupla é completada."}
                </div>
              )}

              {latestInvite && !hasActiveInvite && !isArchived ? (
                <p className="mt-3 text-sm text-muted">
                  Último convite registrado:{" "}
                  <span className="font-semibold text-foreground">
                    {latestInvite.status}
                  </span>
                  .
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </section>

      <Card className="p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <History className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Histórico
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Resultados anteriores continuam acessíveis mesmo depois do
                  arquivamento.
                </p>
              </div>
            </div>
          </div>

          {isArchived ? (
            <p className="text-sm text-muted">
              Arquivada em{" "}
              <span className="font-semibold text-foreground">
                {pair.archivedAt
                  ? formatProductDateTime(pair.archivedAt)
                  : "data não registrada"}
              </span>
              .
            </p>
          ) : null}
        </div>

        {historySnapshot.periods.length === 0 ? (
          <div className="mt-5 rounded-[1.5rem] border border-dashed border-line-strong bg-white/60 p-4 text-sm text-muted">
            Nenhum período encerrado por aqui ainda.
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {historySnapshot.periods.map((period) => (
              <div
                key={period.id}
                className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-foreground">
                      {period.label}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Encerrado em{" "}
                      {period.closedAt
                        ? formatProductDateTime(period.closedAt)
                        : "data não registrada"}{" "}
                      · {period.expenseCount} despesa(s)
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {period.settlement ? (
                        period.settlement.transferAmountCents === 0 ? (
                          "Resultado zerado: ninguém deve nada."
                        ) : (
                          <>
                            {period.settlement.payerName} paga{" "}
                            {formatCurrencyFromCents(
                              period.settlement.transferAmountCents,
                            )}{" "}
                            para {period.settlement.receiverName}.
                          </>
                        )
                      ) : (
                        "Resultado indisponível."
                      )}
                    </p>
                  </div>

                  <Button asChild variant="secondary">
                    <Link
                      href={`/app/duplas/${pair.id}/periodo?periodId=${period.id}`}
                    >
                      Ver resultado
                      <ArrowLeft className="size-4 rotate-180" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card variant="soft">
        <div className="flex items-center gap-3">
          <Lock className="size-4 text-brand" />
          <p className="text-sm text-muted">
            Arquivamento e reativação preservam membros, períodos e resultados.
          </p>
        </div>
      </Card>
    </div>
  );
}
