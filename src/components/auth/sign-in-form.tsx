"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { initialAuthActionState } from "@/server/auth/action-state";
import { loginWithCredentials } from "@/server/auth/actions";

type SignInFormProps = {
  callbackUrl: string;
  errorMessage?: string | null;
};

export function SignInForm({ callbackUrl, errorMessage }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginWithCredentials,
    initialAuthActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-foreground">
          {errorMessage}
        </div>
      ) : null}
      <form action={formAction} className="space-y-4">
        <input name="callbackUrl" type="hidden" value={callbackUrl} />
        <div>
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="email"
          >
            Email
          </label>
          <Input
            autoComplete="email"
            className="mt-2"
            id="email"
            name="email"
            placeholder="voce@exemplo.com"
            type="email"
          />
          <FieldError message={state.fieldErrors?.email?.[0]} />
        </div>
        <div>
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="password"
          >
            Senha
          </label>
          <Input
            autoComplete="current-password"
            className="mt-2"
            id="password"
            name="password"
            placeholder="Sua senha segura"
            type="password"
          />
          <FieldError message={state.fieldErrors?.password?.[0]} />
        </div>
        <Button fullWidth disabled={isPending} size="lg" type="submit">
          {isPending ? "Entrando..." : "Entrar na conta"}
          <ArrowRight className="size-4" />
        </Button>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-line" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.22em] text-muted">
          <span className="bg-[var(--surface)] px-3">ou</span>
        </div>
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <p className="text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link
          className="font-semibold text-brand transition hover:text-brand-strong"
          href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        >
          Crie seu acesso
        </Link>
      </p>
    </div>
  );
}
