import { CircleHelp, FolderHeart, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { getDashboardSnapshot } from "@/server/auth/repository";

export default async function AppPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { user, activePairsCount } = await getDashboardSnapshot(
    session.user.id,
  );

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden p-7 sm:p-8" variant="accent">
        <p className="eyebrow text-xs font-semibold text-brand">
          Painel autenticado
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Oi, {user.name}.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Sua sessão está persistida e a estrutura base do produto já separa o
          que é público, privado e fluxo especial de convite.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/55 bg-white/70 p-4">
            <p className="text-sm text-muted">Duplas ativas</p>
            <p className="font-display mt-2 text-4xl leading-none">
              {activePairsCount}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/55 bg-white/70 p-4">
            <p className="text-sm text-muted">Métodos de acesso</p>
            <p className="font-display mt-2 text-4xl leading-none">2</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/55 bg-white/70 p-4">
            <p className="text-sm text-muted">Chave Pix</p>
            <p className="font-display mt-2 text-4xl leading-none">
              {user.pixKey ? "OK" : "Pendente"}
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <EmptyState
          action={
            <Modal
              description="As próximas etapas entram em domínio de dupla, convite e período. A base de interação já está pronta para receber esse fluxo."
              title="Próximas entregas"
              trigger={<Button>Ver o que entra depois</Button>}
            >
              <div className="space-y-3">
                <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
                  <p className="text-sm font-semibold text-brand">Etapa 4</p>
                  <p className="mt-1 text-sm text-muted">
                    Complemento de perfil com nome e chave Pix opcional.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
                  <p className="text-sm font-semibold text-brand">Etapa 5</p>
                  <p className="mt-1 text-sm text-muted">
                    Criação e gestão das duplas ativas.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
                  <p className="text-sm font-semibold text-brand">Etapa 6+</p>
                  <p className="mt-1 text-sm text-muted">
                    Convites, períodos, despesas e resultado de acerto.
                  </p>
                </div>
              </div>
            </Modal>
          }
          description="Ainda não existem duplas criadas para esta conta. Isso é esperado nesta entrega: o shell já está funcional e pronto para receber a camada de domínio."
          icon={<FolderHeart className="size-7" />}
          title="Nenhuma dupla por enquanto"
        />

        <div className="space-y-4">
          <Card variant="soft">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Infra pronta
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Build standalone, Prisma, envs e auth alinhados.
                </p>
              </div>
            </div>
          </Card>

          <Card variant="soft">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <CircleHelp className="size-5" />
              </div>
              <div>
                <h2 className="font-display text-3xl leading-none">
                  Mensagem base
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Erros de autenticação e ações já seguem padrão consistente.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
