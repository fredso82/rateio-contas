"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getErrorMessage, logServerError } from "@/lib/errors";
import {
  expenseSchema,
  parseBrlInputToCents,
  parseExpenseDateInput,
} from "@/lib/validation/expense";
import {
  type ExpenseActionState,
} from "@/server/periods/action-state";
import {
  closePeriodParticipation,
  createExpenseForPeriod,
  deleteExpenseForUser,
  openPeriodForPair,
  reopenPeriod,
  updateExpenseForUser,
} from "@/server/periods/repository";

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/entrar?callbackUrl=%2Fapp%2Fduplas");
  }

  return session.user.id;
}

function redirectToPeriod(pairId: string) {
  return `/app/duplas/${pairId}/periodo`;
}

function buildExpensePayload(formData: FormData) {
  const rawData = {
    description: stringFromFormData(formData.get("description")),
    amount: stringFromFormData(formData.get("amount")),
    occurredOn: stringFromFormData(formData.get("occurredOn")),
  };
  const parsedExpense = expenseSchema.safeParse(rawData);

  if (!parsedExpense.success) {
    return {
      success: false as const,
      error: {
        status: "error" as const,
        message: "Revise os campos e tente novamente.",
        fieldErrors: parsedExpense.error.flatten().fieldErrors,
      } satisfies ExpenseActionState,
    };
  }

  return {
    success: true as const,
    data: {
      description: parsedExpense.data.description,
      amountCents: parseBrlInputToCents(parsedExpense.data.amount)!,
      occurredOn: parseExpenseDateInput(parsedExpense.data.occurredOn)!,
    },
  };
}

export async function openPairPeriod(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));

  if (!pairId) {
    redirect("/app/duplas");
  }

  try {
    await openPeriodForPair(pairId, userId);
  } catch (error) {
    logServerError("Falha ao abrir período da dupla.", error);
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}

export async function createPeriodExpense(
  _previousState: ExpenseActionState,
  formData: FormData,
) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));
  const periodId = stringFromFormData(formData.get("periodId"));

  if (!pairId || !periodId) {
    redirect("/app/duplas");
  }

  const parsedPayload = buildExpensePayload(formData);

  if (!parsedPayload.success) {
    return parsedPayload.error;
  }

  try {
    await createExpenseForPeriod(periodId, userId, parsedPayload.data);
  } catch (error) {
    logServerError("Falha ao criar despesa do período.", error);

    return {
      status: "error",
      message: getErrorMessage(error, "Não foi possível salvar a despesa."),
    } satisfies ExpenseActionState;
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}

export async function updatePeriodExpense(
  _previousState: ExpenseActionState,
  formData: FormData,
) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));
  const expenseId = stringFromFormData(formData.get("expenseId"));

  if (!pairId || !expenseId) {
    redirect("/app/duplas");
  }

  const parsedPayload = buildExpensePayload(formData);

  if (!parsedPayload.success) {
    return parsedPayload.error;
  }

  try {
    await updateExpenseForUser(expenseId, userId, parsedPayload.data);
  } catch (error) {
    logServerError("Falha ao atualizar despesa do período.", error);

    return {
      status: "error",
      message: getErrorMessage(error, "Não foi possível atualizar a despesa."),
    } satisfies ExpenseActionState;
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}

export async function deletePeriodExpense(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));
  const expenseId = stringFromFormData(formData.get("expenseId"));

  if (!pairId || !expenseId) {
    redirect("/app/duplas");
  }

  try {
    await deleteExpenseForUser(expenseId, userId);
  } catch (error) {
    logServerError("Falha ao excluir despesa do período.", error);
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}

export async function closeViewerPeriodParticipation(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));
  const periodId = stringFromFormData(formData.get("periodId"));

  if (!pairId || !periodId) {
    redirect("/app/duplas");
  }

  try {
    await closePeriodParticipation(periodId, userId);
  } catch (error) {
    logServerError("Falha ao fechar participação no período.", error);
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}

export async function reopenViewerPeriod(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));
  const periodId = stringFromFormData(formData.get("periodId"));

  if (!pairId || !periodId) {
    redirect("/app/duplas");
  }

  try {
    await reopenPeriod(periodId, userId);
  } catch (error) {
    logServerError("Falha ao reabrir período.", error);
  }

  revalidatePath(`/app/duplas/${pairId}`);
  revalidatePath(redirectToPeriod(pairId));
  redirect(redirectToPeriod(pairId));
}
