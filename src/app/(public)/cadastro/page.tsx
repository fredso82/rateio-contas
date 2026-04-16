import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card } from "@/components/ui/card";
import { sanitizeRedirect } from "@/lib/navigation";

type SignUpPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = sanitizeRedirect(callbackUrl);

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8" variant="soft">
        <p className="eyebrow text-xs font-semibold text-brand">
          Primeiro acesso
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Crie a conta e já caia no painel autenticado.
        </h1>
        <p className="mt-4 text-lg text-muted">
          O cadastro usa hash seguro, cria a conta local e já abre sessão
          persistida sem precisar de uma segunda etapa.
        </p>
      </Card>

      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">Cadastro</p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          Vamos deixar sua base pronta.
        </h2>
        <p className="mt-3 text-base text-muted">
          Nome, email e senha bastam para entrar agora. O restante do perfil
          pode evoluir nas próximas etapas.
        </p>
        <div className="mt-8">
          <SignUpForm callbackUrl={safeCallbackUrl} />
        </div>
      </Card>
    </div>
  );
}
