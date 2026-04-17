"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getErrorMessage, logServerError } from "@/lib/errors";
import { pairSchema } from "@/lib/validation/pair";
import { type PairActionState } from "@/server/pairs/action-state";
import {
  archivePairForUser,
  createPairForUser,
  reactivatePairForUser,
} from "@/server/pairs/repository";
import { generateInviteForPair } from "@/server/invites/repository";

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

export async function createPair(
  _previousState: PairActionState,
  formData: FormData,
) {
  const userId = await requireUserId();
  const parsedPair = pairSchema.safeParse({
    name: stringFromFormData(formData.get("name")),
  });

  if (!parsedPair.success) {
    return {
      status: "error",
      message: "Revise os campos e tente novamente.",
      fieldErrors: parsedPair.error.flatten().fieldErrors,
    } satisfies PairActionState;
  }

  let pair: Awaited<ReturnType<typeof createPairForUser>>;

  try {
    pair = await createPairForUser(userId, parsedPair.data);
  } catch (error) {
    logServerError("Falha ao criar dupla.", error);

    return {
      status: "error",
      message: getErrorMessage(error, "Não foi possível criar a dupla agora."),
    } satisfies PairActionState;
  }

  revalidatePath("/app/duplas");
  redirect(`/app/duplas/${pair.id}`);
}

export async function generatePairInvite(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));

  if (!pairId) {
    redirect("/app/duplas");
  }

  try {
    await generateInviteForPair(pairId, userId);
  } catch (error) {
    logServerError("Falha ao gerar convite da dupla.", error);
  }

  revalidatePath(`/app/duplas/${pairId}`);
  redirect(`/app/duplas/${pairId}`);
}

export async function archiveViewerPair(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));

  if (!pairId) {
    redirect("/app/duplas");
  }

  try {
    await archivePairForUser(pairId, userId);
  } catch (error) {
    logServerError("Falha ao arquivar dupla.", error);
  }

  revalidatePath("/app/duplas");
  revalidatePath("/app/duplas/arquivadas");
  revalidatePath(`/app/duplas/${pairId}`);
  redirect(`/app/duplas/${pairId}`);
}

export async function reactivateViewerPair(formData: FormData) {
  const userId = await requireUserId();
  const pairId = stringFromFormData(formData.get("pairId"));

  if (!pairId) {
    redirect("/app/duplas");
  }

  try {
    await reactivatePairForUser(pairId, userId);
  } catch (error) {
    logServerError("Falha ao reativar dupla.", error);
  }

  revalidatePath("/app/duplas");
  revalidatePath("/app/duplas/arquivadas");
  revalidatePath(`/app/duplas/${pairId}`);
  redirect(`/app/duplas/${pairId}`);
}
