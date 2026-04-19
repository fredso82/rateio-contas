import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card } from "@/components/ui/card";
import { isGoogleAuthEnabled } from "@/lib/auth-providers";
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
  const googleEnabled = isGoogleAuthEnabled();

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">Cadastro</p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          Vamos deixar sua base pronta.
        </h2>
        <p className="mt-3 text-base text-muted">
          {googleEnabled
            ? "Nome, email e senha bastam para entrar agora. Se preferir, voce tambem pode usar Google."
            : "Nome, email e senha bastam para entrar agora. O login com Google fica disponivel depois que a aplicacao tiver um dominio publico."}
        </p>
        <div className="mt-8">
          <SignUpForm
            callbackUrl={safeCallbackUrl}
            googleEnabled={googleEnabled}
          />
        </div>
      </Card>
    </div>
  );
}
