import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card } from "@/components/ui/card";
import { sanitizeRedirect } from "@/lib/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const safeCallbackUrl = sanitizeRedirect(callbackUrl);

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-8" variant="soft">
        <p className="eyebrow text-xs font-semibold text-brand">Acesso</p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Entre e volte direto para o que estava fazendo.
        </h1>
        <p className="mt-4 text-lg text-muted">
          A sessão fica persistida para web e PWA, com retorno consistente para
          painel privado ou fluxo de convite.
        </p>
      </Card>

      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">Entrar</p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          Continue com email ou Google.
        </h2>
        <p className="mt-3 text-base text-muted">
          As mensagens de erro já seguem o padrão base do produto.
        </p>
        <div className="mt-8">
          <SignInForm callbackUrl={safeCallbackUrl} />
        </div>
      </Card>
    </div>
  );
}
