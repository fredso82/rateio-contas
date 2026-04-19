import Link from "next/link";
import { ArrowRight, BadgeCheck, Clock3, HandCoins, Link2 } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  {
    icon: Clock3,
    title: "Feche períodos sem atrito",
    description:
      "Cada etapa da rotina fica clara, com status visíveis e foco no que ainda precisa acontecer.",
  },
  {
    icon: Link2,
    title: "Convide com um único link",
    description:
      "Convites fazem parte do fluxo, sem improviso por mensagem solta ou planilha paralela.",
  },
  {
    icon: HandCoins,
    title: "Mostre o acerto final com contexto",
    description:
      "O resultado aparece com linguagem objetiva, inclusive quando ninguém deve nada.",
  },
];

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-8 sm:p-10" variant="accent">
          <p className="eyebrow text-xs font-semibold text-brand">
            MVP em construção real
          </p>
          <h1 className="font-display balanced-text mt-6 text-5xl leading-none sm:text-6xl">
            Rateio entre duas pessoas, pensado para rotina de verdade.
          </h1>
          <p className="balanced-text mt-5 max-w-2xl text-lg text-muted sm:text-xl">
            O app já sobe com shell mobile first, autenticação completa e base
            pronta para crescer com dupla, convite, período e fechamento.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={session ? "/app" : "/cadastro"}>
                {session ? "Abrir meu painel" : "Começar agora"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/entrar">Entrar com conta existente</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/55 bg-white/65 p-4">
              <p className="text-sm text-muted">Sessão</p>
              <p className="mt-1 font-display text-3xl leading-none">
                Persistida
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/55 bg-white/65 p-4">
              <p className="text-sm text-muted">Login</p>
              <p className="mt-1 font-display text-3xl leading-none">
                Email + Google
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/55 bg-white/65 p-4">
              <p className="text-sm text-muted">Deploy</p>
              <p className="mt-1 font-display text-3xl leading-none">
                VPS ready
              </p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="eyebrow text-xs font-semibold text-muted">
              Estado atual
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none">
              Base sólida para as próximas etapas.
            </h2>
          </div>
          <div className="mt-8 space-y-4">
            <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
              <p className="text-sm font-semibold text-brand">Etapa 1</p>
              <p className="mt-1 text-sm text-muted">
                Next.js, Tailwind, Prisma, envs, scripts e build de produção.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
              <p className="text-sm font-semibold text-brand">Etapa 2</p>
              <p className="mt-1 text-sm text-muted">
                Tokens visuais, layout público/privado e componentes base.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
              <p className="text-sm font-semibold text-brand">Etapa 3</p>
              <p className="mt-1 text-sm text-muted">
                Cadastro, login, Google, sessão persistida e proteção de rotas.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <Card key={title} variant="soft">
            <div className="flex size-12 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
              <Icon className="size-5" />
            </div>
            <h3 className="font-display mt-5 text-3xl leading-none">{title}</h3>
            <p className="mt-3 text-base text-muted">{description}</p>
          </Card>
        ))}
      </section>

      <section className="section-frame rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-xs font-semibold text-muted">
              Navegação já preparada
            </p>
            <h2 className="font-display mt-3 text-4xl leading-none">
              Áreas públicas, privadas e convite já têm trilho próprio.
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold">
            <BadgeCheck className="size-4 text-success" />
            Estrutura pronta para crescer
          </div>
        </div>
      </section>
    </div>
  );
}
