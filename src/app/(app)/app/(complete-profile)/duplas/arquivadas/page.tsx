import Link from "next/link";
import { Archive, ArrowLeft, ArrowRight, FolderArchive } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { listUserPairs } from "@/server/pairs/repository";
import { formatProductDateTime } from "@/lib/utils";

export default async function ArchivedPairsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { archivedPairs } = await listUserPairs(session.user.id);

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
              Duplas arquivadas
            </p>
            <h1 className="font-display mt-5 text-5xl leading-none">
              Histórico organizado, sem perder contexto.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted">
              Arquive duplas concluídas para limpar a lista principal, mas siga
              com acesso rápido aos períodos e resultados anteriores.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-muted">
            <Archive className="size-4 text-brand" />
            {archivedPairs.length} dupla(s) arquivada(s)
          </div>
        </div>
      </Card>

      {archivedPairs.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link href="/app/duplas">Voltar para lista principal</Link>
            </Button>
          }
          description="Quando você arquivar uma dupla, ela aparecerá aqui com o histórico preservado."
          icon={<FolderArchive className="size-7" />}
          title="Nada arquivado por enquanto"
        />
      ) : (
        <section className="grid gap-4">
          {archivedPairs.map((pair) => (
            <Card key={pair.id} className="p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-xs font-semibold text-muted">
                    <Archive className="size-3.5" />
                    Arquivada
                  </div>
                  <h2 className="font-display mt-4 text-4xl leading-none">
                    {pair.name}
                  </h2>
                  <p className="mt-3 text-base text-muted">
                    Atualizada por último em{" "}
                    {formatProductDateTime(pair.updatedAt)}.
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

                <Button asChild variant="secondary">
                  <Link href={`/app/duplas/${pair.id}`}>
                    Ver detalhes
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
