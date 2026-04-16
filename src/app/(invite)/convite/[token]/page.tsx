import Link from "next/link";
import { ArrowRight, Link2, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();
  const callbackUrl = `/convite/${token}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-8 sm:px-6">
      <Card className="w-full p-8 sm:p-10">
        <div className="flex size-14 items-center justify-center rounded-[1.4rem] bg-accent-soft text-brand">
          <Link2 className="size-6" />
        </div>
        <p className="eyebrow mt-6 text-xs font-semibold text-brand">
          Fluxo especial
        </p>
        <h1 className="font-display mt-4 text-5xl leading-none">
          Convite identificado.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Nesta etapa o sistema já preserva o retorno correto para este convite
          após autenticação. A aceitação funcional do convite entra na próxima
          camada de domínio.
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
          <p className="text-sm text-muted">Token recebido</p>
          <p className="mt-1 break-all font-mono text-sm text-foreground">
            {token}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {session ? (
            <Button asChild size="lg">
              <Link href="/app">
                Ir para o painel
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild size="lg">
                <Link
                  href={`/entrar?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                >
                  Entrar para continuar
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link
                  href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                >
                  Criar conta primeiro
                </Link>
              </Button>
            </>
          )}
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-muted">
          <ShieldCheck className="size-4 text-success" />
          Retorno pós-login já preservado
        </div>
      </Card>
    </div>
  );
}
