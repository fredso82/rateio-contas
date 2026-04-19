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
      <section>
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
