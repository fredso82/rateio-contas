"use client";

import { useActionState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { initialPairActionState } from "@/server/pairs/action-state";
import { createPair } from "@/server/pairs/actions";

export function PairCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createPair,
    initialPairActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-foreground" htmlFor="name">
          Nome da dupla
        </label>
        <Input
          autoComplete="off"
          className="mt-2"
          id="name"
          name="name"
          placeholder="Ex.: Casa, viagem, mercado"
          type="text"
        />
        <FieldError message={state.fieldErrors?.name?.[0]} />
        <p className="mt-2 text-sm text-muted">
          Escolha um nome curto e fácil de reconhecer no dia a dia.
        </p>
      </div>

      <Button fullWidth disabled={isPending} size="lg" type="submit">
        {isPending ? "Criando dupla..." : "Criar dupla"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
