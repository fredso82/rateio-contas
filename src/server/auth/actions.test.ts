import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { initialAuthActionState } from "@/server/auth/action-state";

const {
  authMock,
  signInMock,
  signOutMock,
  registerCredentialsUserMock,
  cookiesMock,
  getClientIpMock,
  loggerErrorMock,
  MockAuthError,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  registerCredentialsUserMock: vi.fn(),
  cookiesMock: vi.fn(),
  getClientIpMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  MockAuthError: class extends Error {
    constructor(public type: string) {
      super(type);
      this.name = "AuthError";
    }
  },
}));

vi.mock("next-auth", () => ({
  AuthError: MockAuthError,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
  signIn: signInMock,
  signOut: signOutMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/server/auth/repository", () => ({
  registerCredentialsUser: registerCredentialsUserMock,
}));

vi.mock("@/lib/request-context", () => ({
  getClientIp: getClientIpMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: loggerErrorMock,
    warn: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

import {
  continueWithGoogle,
  linkGoogleAccount,
  loginWithCredentials,
  logout,
  registerWithCredentials,
} from "@/server/auth/actions";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("auth server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClientIpMock.mockResolvedValue("127.0.0.1");
    cookiesMock.mockResolvedValue({
      set: vi.fn(),
    });
  });

  it("returns field errors when login payload is invalid", async () => {
    const result = await loginWithCredentials(
      initialAuthActionState,
      buildFormData({
        email: "invalid",
        password: "123",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.message).toBe("Revise os campos e tente novamente.");
    expect(result.fieldErrors?.email).toContain("Digite um email válido.");
    expect(result.fieldErrors?.password).toContain(
      "Use pelo menos 8 caracteres.",
    );
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("calls signIn with a sanitized callback when login payload is valid", async () => {
    signInMock.mockResolvedValue(undefined);

    const result = await loginWithCredentials(
      initialAuthActionState,
      buildFormData({
        email: "  user@example.com ",
        password: "12345678",
        callbackUrl: "//evil.example",
      }),
    );

    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "user@example.com",
      password: "12345678",
      redirectTo: "/app",
    });
    expect(result).toBe(initialAuthActionState);
  });

  it("maps credential auth errors to a friendly login message", async () => {
    signInMock.mockRejectedValue(new MockAuthError("CredentialsSignin"));

    const result = await loginWithCredentials(
      initialAuthActionState,
      buildFormData({
        email: "user@example.com",
        password: "12345678",
        callbackUrl: "/convite/token-123",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Email ou senha inválidos.",
    });
  });

  it("creates the account and signs the user in during registration", async () => {
    registerCredentialsUserMock.mockResolvedValue({
      id: "user_123",
      name: "Conta Teste",
      email: "user@example.com",
    });
    signInMock.mockResolvedValue(undefined);

    const result = await registerWithCredentials(
      initialAuthActionState,
      buildFormData({
        name: " Conta Teste ",
        email: "USER@example.com",
        password: "12345678",
        callbackUrl: "/convite/token-123",
      }),
    );

    expect(registerCredentialsUserMock).toHaveBeenCalledWith({
      name: "Conta Teste",
      email: "USER@example.com",
      password: "12345678",
    });
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      email: "USER@example.com",
      password: "12345678",
      redirectTo: "/convite/token-123",
    });
    expect(result).toBe(initialAuthActionState);
  });

  it("returns the app error message when registration fails", async () => {
    registerCredentialsUserMock.mockRejectedValue(
      new AppError("Este email já está em uso.", "EMAIL_IN_USE", 409),
    );

    const result = await registerWithCredentials(
      initialAuthActionState,
      buildFormData({
        name: "Conta Teste",
        email: "user@example.com",
        password: "12345678",
        callbackUrl: "/app",
      }),
    );

    expect(result).toEqual({
      status: "error",
      message: "Este email já está em uso.",
    });
    expect(loggerErrorMock).toHaveBeenCalled();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("starts the Google flow with a sanitized callback and supports logout", async () => {
    signInMock.mockResolvedValue(undefined);
    signOutMock.mockResolvedValue(undefined);

    await continueWithGoogle(
      buildFormData({
        callbackUrl: "https://evil.example",
      }),
    );

    await logout();

    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/app",
    });
    expect(signOutMock).toHaveBeenCalledWith({
      redirectTo: "/",
    });
  });

  it("starts the Google link flow for an authenticated user", async () => {
    const cookieStore = {
      set: vi.fn(),
    };

    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
    cookiesMock.mockResolvedValue(cookieStore);
    signInMock.mockResolvedValue(undefined);

    await linkGoogleAccount();

    expect(cookieStore.set).toHaveBeenCalledTimes(1);
    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/app/perfil?linked=google",
    });
  });
});
