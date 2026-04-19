import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card } from "@/components/ui/card";
import { isGoogleAuthEnabled } from "@/lib/auth-providers";
import { sanitizeRedirect } from "@/lib/navigation";

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

const signInErrorMessages: Record<string, string> = {
  ACCOUNT_LINK_REQUIRED:
    "Já existe uma conta com esse email. Entre com seu método atual e vincule o Google pelo perfil.",
  GOOGLE_NOT_AVAILABLE:
    "O login com Google ainda nao esta disponivel neste ambiente. Entre com email e senha.",
  GOOGLE_EMAIL_NOT_VERIFIED:
    "Use uma conta Google com email verificado para entrar.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;
  const safeCallbackUrl = sanitizeRedirect(callbackUrl);
  const errorMessage = error ? signInErrorMessages[error] ?? null : null;
  const googleEnabled = isGoogleAuthEnabled();

  if (session) {
    redirect(safeCallbackUrl);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 sm:p-10">
        <p className="eyebrow text-xs font-semibold text-muted">Entrar</p>
        <h2 className="font-display mt-4 text-4xl leading-none">
          {googleEnabled
            ? "Continue com email ou Google."
            : "Continue com email e senha."}
        </h2>
        <div className="mt-8">
          <SignInForm
            callbackUrl={safeCallbackUrl}
            errorMessage={errorMessage}
            googleEnabled={googleEnabled}
          />
        </div>
      </Card>
    </div>
  );
}
