import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { ExpenseForm } from "@/components/periods/expense-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dateToInputValue } from "@/lib/utils";
import { updatePeriodExpense } from "@/server/periods/actions";
import { getExpenseEditorSnapshot } from "@/server/periods/repository";

type EditExpensePageProps = {
  params: Promise<{
    pairId: string;
    expenseId: string;
  }>;
};

export default async function EditExpensePage({ params }: EditExpensePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { pairId, expenseId } = await params;
  const { expense, pairName, periodId, periodLabel } =
    await getExpenseEditorSnapshot(pairId, expenseId, session.user.id);

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
          Editar despesa
        </p>
        <h1 className="font-display mt-5 text-5xl leading-none">
          Ajuste o lançamento sem perder o ritmo.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Você está editando uma despesa do período {periodLabel} em {pairName}.
        </p>
      </Card>

      <Card className="p-8 sm:p-10">
        {!expense.canEdit ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Essa despesa não pode mais ser alterada.
            </p>
            <p className="text-sm text-muted">
              O período já foi fechado ou a sua participação já foi encerrada.
            </p>
          </div>
        ) : (
          <>
            <p className="eyebrow text-xs font-semibold text-muted">
              {periodLabel}
            </p>
            <h2 className="font-display mt-4 text-4xl leading-none">
              Atualize os dados da despesa.
            </h2>
            <p className="mt-3 text-base text-muted">
              Depois de salvar, você volta direto para a visão do período.
            </p>
            <div className="mt-8">
              <ExpenseForm
                action={updatePeriodExpense}
                defaultAmount={(expense.amountCents / 100).toFixed(2).replace(".", ",")}
                defaultDescription={expense.description}
                defaultOccurredOn={dateToInputValue(expense.occurredOn)}
                expenseId={expense.id}
                pairId={pairId}
                pendingLabel="Atualizando despesa..."
                periodId={periodId}
                submitLabel="Salvar alteração"
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
