"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { getErrorMessage, logServerError } from "@/lib/errors";
import { profileSchema } from "@/lib/validation/profile";
import { type ProfileActionState } from "@/server/profile/action-state";
import { saveUserProfile } from "@/server/profile/repository";

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function saveProfile(
  _previousState: ProfileActionState,
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/entrar?callbackUrl=%2Fapp%2Fperfil");
  }

  const parsedProfile = profileSchema.safeParse({
    name: stringFromFormData(formData.get("name")),
    pixKey: stringFromFormData(formData.get("pixKey")),
  });

  if (!parsedProfile.success) {
    return {
      status: "error",
      message: "Revise os campos e tente novamente.",
      fieldErrors: parsedProfile.error.flatten().fieldErrors,
    } satisfies ProfileActionState;
  }

  let result: Awaited<ReturnType<typeof saveUserProfile>>;

  try {
    result = await saveUserProfile(session.user.id, parsedProfile.data);
  } catch (error) {
    logServerError("Falha ao salvar perfil.", error);

    return {
      status: "error",
      message: getErrorMessage(
        error,
        "Não foi possível salvar seu perfil agora.",
      ),
    } satisfies ProfileActionState;
  }

  revalidatePath("/app");
  revalidatePath("/app/perfil");
  revalidatePath("/app/duplas");

  if (result.completedForTheFirstTime) {
    redirect("/app/duplas");
  }

  return {
    status: "success",
    message: "Perfil atualizado com sucesso.",
  } satisfies ProfileActionState;
}
