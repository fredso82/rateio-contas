"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { getErrorMessage, logServerError } from "@/lib/errors";
import { sanitizeRedirect } from "@/lib/navigation";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/server/auth/action-state";
import { registerCredentialsUser } from "@/server/auth/repository";

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function parseCallbackUrl(formData: FormData) {
  return sanitizeRedirect(stringFromFormData(formData.get("callbackUrl")));
}

function getAuthErrorMessage(error: AuthError) {
  switch (error.type) {
    case "CredentialsSignin":
      return "Email ou senha inválidos.";
    default:
      return "Não foi possível concluir a autenticação agora.";
  }
}

export async function loginWithCredentials(
  _previousState: AuthActionState,
  formData: FormData,
) {
  const callbackUrl = parseCallbackUrl(formData);
  const parsedCredentials = signInSchema.safeParse({
    email: stringFromFormData(formData.get("email")),
    password: stringFromFormData(formData.get("password")),
  });

  if (!parsedCredentials.success) {
    return {
      status: "error",
      message: "Revise os campos e tente novamente.",
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
    } satisfies AuthActionState;
  }

  try {
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: getAuthErrorMessage(error),
      } satisfies AuthActionState;
    }

    throw error;
  }

  return initialAuthActionState;
}

export async function registerWithCredentials(
  _previousState: AuthActionState,
  formData: FormData,
) {
  const callbackUrl = parseCallbackUrl(formData);
  const parsedCredentials = signUpSchema.safeParse({
    name: stringFromFormData(formData.get("name")),
    email: stringFromFormData(formData.get("email")),
    password: stringFromFormData(formData.get("password")),
  });

  if (!parsedCredentials.success) {
    return {
      status: "error",
      message: "Revise os campos e tente novamente.",
      fieldErrors: parsedCredentials.error.flatten().fieldErrors,
    } satisfies AuthActionState;
  }

  try {
    await registerCredentialsUser(parsedCredentials.data);
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: getAuthErrorMessage(error),
      } satisfies AuthActionState;
    }

    logServerError("Falha ao cadastrar usuário.", error);

    return {
      status: "error",
      message: getErrorMessage(
        error,
        "Não foi possível criar sua conta agora.",
      ),
    } satisfies AuthActionState;
  }

  return initialAuthActionState;
}

export async function continueWithGoogle(formData: FormData) {
  await signIn("google", {
    redirectTo: parseCallbackUrl(formData),
  });
}

export async function logout() {
  await signOut({
    redirectTo: "/",
  });
}
