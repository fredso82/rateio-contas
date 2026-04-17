import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Link2, ShieldCheck } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  acceptInvite,
  type InviteLandingSnapshot,
  getInviteLandingSnapshot,
} from "@/server/invites/repository";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();
  const callbackUrl = `/convite/${token}`;
  let invite: InviteLandingSnapshot = await getInviteLandingSnapshot(
    token,
    session?.user?.id,
  );

  if (invite.kind === "already_member") {
    redirect(`/app/duplas/${invite.pairId}`);
  }

  if (session?.user?.id && invite.kind === "pending") {
    const result = await acceptInvite(token, session.user.id);

    if (result.kind === "joined" || result.kind === "already_member") {
      redirect(`/app/duplas/${result.pairId}`);
    }

    if (result.kind === "accepted") {
      invite = {
        kind: "accepted",
        pairName: invite.pairName,
      };
    }

    if (result.kind === "expired") {
      invite = {
        kind: "expired",
        pairName: invite.pairName,
      };
    }

    if (result.kind === "revoked") {
      invite = {
        kind: "revoked",
        pairName: invite.pairName,
      };
    }

    if (result.kind === "pair_full") {
      invite = {
        kind: "pair_full",
        pairName: invite.pairName,
      };
    }

    if (result.kind === "unavailable") {
      invite = {
        kind: "unavailable",
        pairName: invite.pairName,
      };
    }

    if (result.kind === "invalid") {
      invite = {
        kind: "invalid",
      };
    }
  }

  const stateContent: Record<
    Exclude<typeof invite.kind, "pending" | "already_member">,
    {
      title: string;
      description: string;
      badge: string;
    }
  > = {
    accepted: {
      title: "Esse convite já foi usado.",
      description:
        "A dupla já foi completada com esse link. Se você ainda precisa entrar, peça um novo convite.",
      badge: "Convite encerrado",
    },
    expired: {
      title: "Esse convite expirou.",
      description:
        "Links de convite valem por 24 horas. Peça para a pessoa da dupla gerar um novo link.",
      badge: "Link expirado",
    },
    invalid: {
      title: "Não encontramos esse convite.",
      description:
        "O link pode ter sido alterado, removido ou nunca ter existido.",
      badge: "Convite inválido",
    },
    pair_full: {
      title: "Essa dupla já está completa.",
      description:
        "O sistema bloqueou a entrada porque já existem duas pessoas vinculadas à dupla.",
      badge: "Dupla completa",
    },
    revoked: {
      title: "Esse convite foi substituído.",
      description:
        "Um novo link foi gerado para essa dupla, então este endereço deixou de valer.",
      badge: "Convite revogado",
    },
    unavailable: {
      title: "Esse convite não está mais disponível.",
      description:
        "A dupla vinculada a esse link não está mais aceitando novas entradas neste momento.",
      badge: "Indisponível",
    },
  };

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
          {invite.kind === "pending"
            ? "Convite identificado."
            : stateContent[invite.kind].title}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {invite.kind === "pending"
            ? `Você foi convidado${invite.createdByName ? ` por ${invite.createdByName}` : ""} para entrar na dupla ${invite.pairName}.`
            : stateContent[invite.kind].description}
        </p>
        <div className="mt-6 rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
          {invite.kind === "pending" ? (
            <>
              <p className="text-sm text-muted">Dupla</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {invite.pairName}
              </p>
              <p className="mt-3 text-sm text-muted">Validade</p>
              <p className="mt-1 text-sm text-foreground">
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(invite.expiresAt)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Status</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3 py-1 text-sm font-semibold text-foreground">
                <AlertTriangle className="size-4 text-accent" />
                {stateContent[invite.kind].badge}
              </div>
            </>
          )}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {invite.kind === "pending" && session ? (
            <Button asChild size="lg">
              <Link href="/app/duplas">
                Ir para as duplas
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : invite.kind === "pending" ? (
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
          ) : (
            <Button asChild size="lg" variant="secondary">
              <Link href="/app">
                Voltar para o app
              </Link>
            </Button>
          )}
        </div>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-4 py-2 text-sm font-semibold text-muted">
          {invite.kind === "pending" ? (
            <>
              <ShieldCheck className="size-4 text-success" />
              Retorno pós-login preservado
            </>
          ) : (
            <>
              <CheckCircle2 className="size-4 text-success" />
              Estado do convite validado pelo servidor
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
