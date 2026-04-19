import { BadgeCheck, CircleDashed, Link2, ShieldCheck, WalletCards } from "lucide-react";

import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isGoogleAuthEnabled } from "@/lib/auth-providers";
import { linkGoogleAccount } from "@/server/auth/actions";
import { getProfileSnapshot } from "@/server/profile/repository";

const profileLinkErrorMessages: Record<string, string> = {
  ACCOUNT_LINK_REQUIRED:
    "Essa conta Google já corresponde a um usuário existente. Entre com seu método atual e vincule o Google por aqui.",
  GOOGLE_NOT_AVAILABLE:
    "O login com Google ainda nao esta disponivel neste ambiente.",
  GOOGLE_ACCOUNT_ALREADY_LINKED:
    "Essa conta Google já está vinculada a outro usuário.",
  GOOGLE_EMAIL_NOT_VERIFIED:
    "Use uma conta Google com email verificado para concluir o vínculo.",
  GOOGLE_LINK_FAILED:
    "Não foi possível vincular o Google agora. Tente novamente em instantes.",
};

type ProfilePageProps = {
  searchParams: Promise<{
    linked?: string;
    linkError?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth();
  const googleEnabled = isGoogleAuthEnabled();

  if (!session?.user?.id) {
    return null;
  }

  const [{ user, isProfileComplete, hasGoogleLinked }, { linked, linkError }] =
    await Promise.all([
      getProfileSnapshot(session.user.id),
      searchParams,
    ]);
  const linkErrorMessage = linkError
    ? profileLinkErrorMessages[linkError] ??
      profileLinkErrorMessages.GOOGLE_LINK_FAILED
    : null;

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8" variant="soft">
        <p className="eyebrow text-xs font-semibold text-brand">
          {isProfileComplete ? "Seu perfil" : "Primeiro passo"}
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          {isProfileComplete
            ? "Mantenha seus dados prontos para o acerto."
            : "Falta só ajustar seu perfil para começar."}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {isProfileComplete
            ? "Seu nome aparece na dupla e a chave Pix ajuda quando chegar a etapa de resultado. Você pode atualizar tudo por aqui quando quiser."
            : "No primeiro acesso, pedimos só o essencial para o fluxo andar bem no celular. A chave Pix continua opcional e pode entrar depois."}
        </p>

        <div className="mt-8 space-y-3">
          <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                {isProfileComplete ? (
                  <BadgeCheck className="size-5" />
                ) : (
                  <CircleDashed className="size-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Nome</p>
                <p className="text-sm text-muted">
                  Obrigatório no primeiro acesso.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
                <WalletCards className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Chave Pix
                </p>
                <p className="text-sm text-muted">
                  Opcional agora. Dá para preencher ou editar depois.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-line-strong bg-white/75 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Acesso com Google
              </p>
              <p className="text-sm text-muted">
                {hasGoogleLinked
                  ? "Sua conta Google já está vinculada para acesso rápido."
                  : googleEnabled
                    ? "Você pode vincular o Google depois de entrar com seu método atual."
                    : "O vinculo com Google aparece aqui quando a aplicacao estiver rodando em um dominio publico."}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">
          {isProfileComplete ? "Editar perfil" : "Completar perfil"}
        </p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          {isProfileComplete
            ? "Atualize seus dados essenciais."
            : "Confirme como você quer aparecer no app."}
        </h2>
        <p className="mt-3 text-base text-muted">
          Email de acesso: <span className="font-semibold">{user.email}</span>
        </p>
        {linked === "google" && hasGoogleLinked ? (
          <div className="mt-5 rounded-[1.25rem] border border-success/30 bg-success/10 px-4 py-3 text-sm text-foreground">
            Conta Google vinculada com sucesso.
          </div>
        ) : null}
        {linkErrorMessage ? (
          <div className="mt-5 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-foreground">
            {linkErrorMessage}
          </div>
        ) : null}
        <div className="mt-8">
          <ProfileForm
            defaultName={user.name}
            defaultPixKey={user.pixKey ?? ""}
            isFirstAccess={!isProfileComplete}
          />
        </div>
        {!hasGoogleLinked && googleEnabled ? (
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm font-semibold text-foreground">
              Vincular login com Google
            </p>
            <p className="mt-2 text-sm text-muted">
              Isso adiciona uma segunda forma de entrar sem misturar contas por
              coincidência de email.
            </p>
            <form action={linkGoogleAccount} className="mt-4">
              <Button type="submit" variant="secondary">
                <Link2 className="size-4" />
                Vincular com Google
              </Button>
            </form>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
