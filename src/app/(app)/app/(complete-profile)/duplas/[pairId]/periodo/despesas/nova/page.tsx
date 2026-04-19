import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ExpenseForm } from "@/components/periods/expense-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dateToInputValue } from "@/lib/utils";
import { createPeriodExpense } from "@/server/periods/actions";
import { getPairPeriodWorkspace } from "@/server/periods/repository";

type NewExpensePageProps = {
  params: Promise<{
    pairId: string;
  }>;
};

export default async function NewExpensePage({ params }: NewExpensePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { pairId } = await params;
  const { pair, period } = await getPairPeriodWorkspace(pairId, session.user.id);

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="p-8" variant="soft">
        <Button asChild className="w-fit" variant="ghost">
          <Link href={`/app/duplas/${pairId}/periodo`}>
            <ArrowLeft className="size-4" />
            Voltar para o período
          </Link>
        </Button>

        <p className="eyebrow mt-6 text-xs font-semibold text-brand">
          Nova despesa
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Registre um gasto rápido sem sair do fluxo.
        </h1>
        <p className="mt-4 text-lg text-muted">
          A despesa sempre fica vinculada à sua participação no período atual de{" "}
          {pair.name}.
        </p>
      </Card>

      <Card className="p-8 sm:p-10">
        {!period || !period.canCreateExpense ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Não dá para lançar uma nova despesa agora.
            </p>
            <p className="text-sm text-muted">
              Esse período já foi fechado ou sua participação não está mais aberta.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow text-xs font-semibold text-muted">
              {period.label}
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none">
              Descreva o gasto e siga.
            </h2>
            <p className="mt-3 text-base text-muted">
              O valor é validado em BRL e a data fica registrada no período.
            </p>
            <div className="mt-8">
              <ExpenseForm
                action={createPeriodExpense}
                defaultAmount=""
                defaultDescription=""
                defaultOccurredOn={dateToInputValue(new Date())}
                pairId={pairId}
                pendingLabel="Salvando despesa..."
                periodId={period.id}
                submitLabel="Salvar despesa"
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
