import Link from "next/link";
import { ArrowRight, FolderHeart, Plus, UsersRound } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listUserPairs } from "@/server/pairs/repository";

export default async function PairsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { activePairs, archivedPairs } = await listUserPairs(session.user.id);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-7 sm:p-8" variant="accent">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-xs font-semibold text-brand">
              Duplas ativas
            </p>
            <h1 className="font-display mt-5 text-5xl leading-none">
              Seu ponto de partida agora fica aqui.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Crie uma dupla, veja quem já entrou e acompanhe rapidamente quando
              ainda falta a segunda pessoa.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/app/duplas/nova">
              Nova dupla
              <Plus className="size-4" />
            </Link>
          </Button>
        </div>
      </Card>

      {activePairs.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/app/duplas/nova">Criar primeira dupla</Link>
            </Button>
          }
          description="Você ainda não participa de nenhuma dupla ativa. Crie a primeira agora e já gere um convite quando quiser chamar a outra pessoa."
          icon={<FolderHeart className="size-7" />}
          title="Nenhuma dupla por enquanto"
        />
      ) : (
        <section className="grid gap-4">
          {activePairs.map((pair) => {
            const isIncomplete = pair._count.members < 2;

            return (
              <Card key={pair.id} className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
                      <UsersRound className="size-3.5" />
                      {pair._count.members}/2 pessoas
                    </div>
                    <h2 className="font-display mt-4 text-4xl leading-none">
                      {pair.name}
                    </h2>
                    <p className="mt-3 text-base text-muted">
                      {isIncomplete
                        ? "A dupla já existe, mas ainda está esperando a segunda pessoa entrar."
                        : "Dupla completa e pronta para seguir para os próximos fluxos do produto."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pair.members.map((member) => (
                        <span
                          key={member.user.id}
                          className="rounded-full border border-line bg-white/70 px-3 py-1 text-sm font-medium text-foreground"
                        >
                          {member.user.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button asChild variant={isIncomplete ? "primary" : "secondary"}>
                    <Link href={`/app/duplas/${pair.id}`}>
                      Ver detalhes
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </section>
      )}

      <Card variant="soft">
        <p className="text-sm font-semibold text-foreground">
          Duplas arquivadas
        </p>
        <p className="mt-2 text-sm text-muted">
          {archivedPairs.length === 0
            ? "Nenhuma dupla arquivada até aqui."
            : `${archivedPairs.length} dupla(s) arquivada(s) já aparecem na sua conta.`}
        </p>
      </Card>
    </div>
  );
}
