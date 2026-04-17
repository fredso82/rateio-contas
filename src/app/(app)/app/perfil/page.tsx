import { BadgeCheck, CircleDashed, WalletCards } from "lucide-react";

import { auth } from "@/auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { Card } from "@/components/ui/card";
import { getProfileSnapshot } from "@/server/profile/repository";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { user, isProfileComplete } = await getProfileSnapshot(session.user.id);

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
        <div className="mt-8">
          <ProfileForm
            defaultName={user.name}
            defaultPixKey={user.pixKey ?? ""}
            isFirstAccess={!isProfileComplete}
          />
        </div>
      </Card>
    </div>
  );
}
