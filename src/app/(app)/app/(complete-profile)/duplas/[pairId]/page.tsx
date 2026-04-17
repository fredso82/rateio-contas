import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  Link2,
  Plus,
  UserRoundPlus,
} from "lucide-react";

import { auth } from "@/auth";
import { InviteLinkCard } from "@/components/pairs/invite-link-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPairInviteSnapshot } from "@/server/invites/repository";
import { generatePairInvite } from "@/server/pairs/actions";
import { getPairDetails } from "@/server/pairs/repository";

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
  const [{ pair, isIncomplete }, latestInvite] = await Promise.all([
    getPairDetails(pairId, session.user.id),
    getPairInviteSnapshot(pairId, session.user.id),
  ]);

  const hasActiveInvite =
    latestInvite?.status === "pending" && latestInvite.expiresAt > new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button asChild variant="ghost">
          <Link href="/app/duplas">
            <ArrowLeft className="size-4" />
            Voltar para duplas
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden p-7 sm:p-8" variant="accent">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-xs font-semibold text-brand">
              Detalhe da dupla
            </p>
            <h1 className="font-display mt-5 text-5xl leading-none">
              {pair.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              {isIncomplete
                ? "Você já pode preparar a dupla e mandar o convite. Quando a segunda pessoa entrar, o vínculo fica completo."
                : "As duas pessoas já estão dentro da dupla. O próximo bloco do produto pode partir deste estado."}
            </p>
          </div>

          {isIncomplete ? (
            <form action={generatePairInvite}>
              <input name="pairId" type="hidden" value={pair.id} />
              <Button size="lg" type="submit">
                {hasActiveInvite ? "Gerar novo link" : "Gerar link de convite"}
                <Plus className="size-4" />
              </Button>
            </form>
          ) : null}
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="p-6">
          <p className="text-sm font-semibold text-foreground">Quem está na dupla</p>
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
                  {isIncomplete
                    ? "Dupla incompleta, pronta para receber convite."
                    : "Dupla completa e estável."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <Link2 className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Convite
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {isIncomplete
                    ? "Gere ou regenere um link compartilhável de 24 horas."
                    : "A dupla já está completa, então nenhum novo convite é necessário."}
                </p>
              </div>
            </div>

            <div className="mt-5">
              {hasActiveInvite && latestInvite ? (
                <InviteLinkCard
                  expiresAt={latestInvite.expiresAt.toISOString()}
                  token={latestInvite.token}
                />
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-line-strong bg-white/60 p-4 text-sm text-muted">
                  {isIncomplete
                    ? "Ainda não existe um convite ativo para esta dupla."
                    : "Convites antigos deixam de ser relevantes quando a dupla é completada."}
                </div>
              )}

              {latestInvite && !hasActiveInvite ? (
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
    </div>
  );
}
