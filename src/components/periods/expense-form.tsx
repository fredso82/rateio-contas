"use client";

import { useActionState, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import {
  type ExpenseActionState,
  initialExpenseActionState,
} from "@/server/periods/action-state";

type ExpenseFormProps = {
  action: (
    previousState: ExpenseActionState,
    formData: FormData,
  ) => Promise<ExpenseActionState>;
  pairId: string;
  periodId?: string;
  expenseId?: string;
  defaultDescription: string;
  defaultAmount: string;
  defaultOccurredOn: string;
  submitLabel: string;
  pendingLabel: string;
};

export function ExpenseForm({
  action,
  pairId,
  periodId,
  expenseId,
  defaultDescription,
  defaultAmount,
  defaultOccurredOn,
  submitLabel,
  pendingLabel,
}: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialExpenseActionState,
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state.message, state.status]);

  return (
    <form action={formAction} className="space-y-5">
      <input name="pairId" type="hidden" value={pairId} />
      {periodId ? <input name="periodId" type="hidden" value={periodId} /> : null}
      {expenseId ? (
        <input name="expenseId" type="hidden" value={expenseId} />
      ) : null}

      <div>
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor="description"
        >
          Descrição
        </label>
        <Input
          className="mt-2"
          defaultValue={defaultDescription}
          id="description"
          name="description"
          placeholder="Ex.: mercado, aluguel, farmácia"
          type="text"
        />
        <FieldError message={state.fieldErrors?.description?.[0]} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-foreground" htmlFor="amount">
            Valor em BRL
          </label>
          <Input
            className="mt-2"
            defaultValue={defaultAmount}
            id="amount"
            inputMode="decimal"
            name="amount"
            placeholder="Ex.: 42,90"
            type="text"
          />
          <FieldError message={state.fieldErrors?.amount?.[0]} />
        </div>

        <div>
          <label
            className="text-sm font-semibold text-foreground"
            htmlFor="occurredOn"
          >
            Data
          </label>
          <Input
            className="mt-2"
            defaultValue={defaultOccurredOn}
            id="occurredOn"
            name="occurredOn"
            type="date"
          />
          <FieldError message={state.fieldErrors?.occurredOn?.[0]} />
        </div>
      </div>

      <Button fullWidth disabled={isPending} size="lg" type="submit">
        {isPending ? pendingLabel : submitLabel}
        {expenseId ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
