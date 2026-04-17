"use client";

import { useActionState, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { saveProfile } from "@/server/profile/actions";
import { initialProfileActionState } from "@/server/profile/action-state";

type ProfileFormProps = {
  defaultName: string;
  defaultPixKey: string;
  isFirstAccess: boolean;
};

export function ProfileForm({
  defaultName,
  defaultPixKey,
  isFirstAccess,
}: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveProfile,
    initialProfileActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }

    if (state.status === "success" && state.message) {
      toast.success(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="name">
          Como você quer aparecer
        </label>
        <Input
          autoComplete="name"
          className="mt-2"
          defaultValue={defaultName}
          id="name"
          name="name"
          placeholder="Seu nome"
          type="text"
        />
        <FieldError message={state.fieldErrors?.name?.[0]} />
      </div>

      <div>
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor="pixKey"
        >
          Chave Pix
        </label>
        <Input
          autoComplete="off"
          className="mt-2"
          defaultValue={defaultPixKey}
          id="pixKey"
          name="pixKey"
          placeholder="Opcional por enquanto"
          type="text"
        />
        <FieldError message={state.fieldErrors?.pixKey?.[0]} />
        <p className="mt-2 text-sm text-muted">
          {isFirstAccess
            ? "Pode deixar esse campo para depois. O importante agora é entrar no fluxo principal."
            : "Você pode preencher ou atualizar essa chave quando quiser."}
        </p>
      </div>

      <Button fullWidth disabled={isPending} size="lg" type="submit">
        {isPending
          ? isFirstAccess
            ? "Salvando..."
            : "Atualizando..."
          : isFirstAccess
            ? "Continuar para as duplas"
            : "Salvar perfil"}
        {isFirstAccess ? <ArrowRight className="size-4" /> : <Check className="size-4" />}
      </Button>
    </form>
  );
}
