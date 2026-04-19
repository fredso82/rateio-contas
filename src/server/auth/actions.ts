"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";

import { auth, signIn, signOut } from "@/auth";
import { isGoogleAuthEnabled } from "@/lib/auth-providers";
import { getErrorMessage, logServerError } from "@/lib/errors";
import { sanitizeRedirect } from "@/lib/navigation";
import {
  createOAuthLinkIntent,
  OAUTH_LINK_COOKIE_NAME,
} from "@/lib/oauth-link";
import { assertRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-context";
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
  const clientIp = await getClientIp();
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
    assertRateLimit({
      key: `auth:login:ip:${clientIp}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    assertRateLimit({
      key: `auth:login:email:${parsedCredentials.data.email.toLowerCase()}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
  const clientIp = await getClientIp();
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
    assertRateLimit({
      key: `auth:register:ip:${clientIp}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    assertRateLimit({
      key: `auth:register:email:${parsedCredentials.data.email.toLowerCase()}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });
    await registerCredentialsUser(parsedCredentials.data);
    await signIn("credentials", {
      email: parsedCredentials.data.email,
      password: parsedCredentials.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
  if (!isGoogleAuthEnabled()) {
    redirect("/entrar?error=GOOGLE_NOT_AVAILABLE");
  }

  const clientIp = await getClientIp();

  assertRateLimit({
    key: `auth:google:start:${clientIp}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  await signIn("google", {
    redirectTo: parseCallbackUrl(formData),
  });
}

export async function linkGoogleAccount() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/entrar?callbackUrl=%2Fapp%2Fperfil");
  }

  if (!isGoogleAuthEnabled()) {
    redirect("/app/perfil?linkError=GOOGLE_NOT_AVAILABLE");
  }

  const clientIp = await getClientIp();

  assertRateLimit({
    key: `auth:google:link:${clientIp}:${session.user.id}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const cookieStore = await cookies();

  cookieStore.set(OAUTH_LINK_COOKIE_NAME, createOAuthLinkIntent(session.user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  await signIn("google", {
    redirectTo: "/app/perfil?linked=google",
  });
}

export async function logout() {
  await signOut({
    redirectTo: "/",
  });
}
