import { beforeEach, describe, expect, it, vi } from "vitest";

const nextAuthMock = vi.fn();
const credentialsProviderMock = vi.fn();
const googleProviderMock = vi.fn();
const verifyCredentialsMock = vi.fn();
const syncGoogleUserMock = vi.fn();
const cookiesMock = vi.fn();
const loggerMock = {
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

vi.mock("next-auth", () => ({
  default: nextAuthMock,
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: credentialsProviderMock,
}));

vi.mock("next-auth/providers/google", () => ({
  default: googleProviderMock,
}));

vi.mock("@/server/auth/repository", () => ({
  syncGoogleUser: syncGoogleUserMock,
  verifyCredentials: verifyCredentialsMock,
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("@/lib/logger", () => ({
  logger: loggerMock,
}));

nextAuthMock.mockImplementation((config: unknown) => ({
  handlers: { GET: vi.fn(), POST: vi.fn() },
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  config,
}));

credentialsProviderMock.mockImplementation((config: unknown) => config);
googleProviderMock.mockImplementation((config: unknown) => config);

const { AppError } = await import("@/lib/errors");
const authModule = await import("@/auth");

const authConfig = nextAuthMock.mock.calls[0]?.[0] as {
  callbacks: {
    redirect: (input: { url: string; baseUrl: string }) => Promise<string>;
    signIn: (input: {
      user: { id: string; email: string | null; name: string | null };
      account?: { provider?: string; providerAccountId: string };
      profile?: {
        email_verified?: boolean;
      };
    }) => Promise<boolean | string>;
    session: (input: {
      session: {
        user: {
          name?: string | null;
          email?: string | null;
          id?: string;
        };
      };
      token: { userId?: string };
    }) => Promise<{
      user: {
        name?: string | null;
        email?: string | null;
        id?: string;
      };
    }>;
  };
};
const credentialsProviderConfig = credentialsProviderMock.mock
  .calls[0]?.[0] as {
  authorize: (credentials: unknown) => Promise<unknown>;
};

describe("auth configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookiesMock.mockResolvedValue({
      get: vi.fn(() => undefined),
      delete: vi.fn(),
    });
  });

  it("uses the credentials provider authorize callback only for valid payloads", async () => {
    verifyCredentialsMock.mockResolvedValue({
      id: "user_123",
      name: "Conta Teste",
      email: "user@example.com",
    });

    const invalidResult = await credentialsProviderConfig.authorize({
      email: "invalid",
      password: "123",
    });

    const validResult = await credentialsProviderConfig.authorize({
      email: "user@example.com",
      password: "12345678",
    });

    expect(invalidResult).toBeNull();
    expect(validResult).toEqual({
      id: "user_123",
      name: "Conta Teste",
      email: "user@example.com",
    });
    expect(verifyCredentialsMock).toHaveBeenCalledTimes(1);
    expect(verifyCredentialsMock).toHaveBeenCalledWith(
      "user@example.com",
      "12345678",
    );
  });

  it("normalizes redirect callbacks to internal paths", async () => {
    await expect(
      authConfig.callbacks.redirect({
        url: "/convite/token-123",
        baseUrl: "http://localhost:3000",
      }),
    ).resolves.toBe("http://localhost:3000/convite/token-123");

    await expect(
      authConfig.callbacks.redirect({
        url: "https://evil.example",
        baseUrl: "http://localhost:3000",
      }),
    ).resolves.toBe("http://localhost:3000/app");
  });

  it("syncs Google users and injects the user id into the session", async () => {
    syncGoogleUserMock.mockResolvedValue({
      id: "user_google",
      name: "Conta Google",
      email: "google@example.com",
    });

    const googleUser = {
      id: "",
      email: "placeholder@example.com",
      name: "Placeholder",
    };

    const signInResult = await authConfig.callbacks.signIn({
      user: googleUser,
      account: {
        provider: "google",
        providerAccountId: "google-account-123",
      },
      profile: {
        email_verified: true,
      },
    });

    const sessionResult = await authConfig.callbacks.session({
      session: {
        user: {
          name: "Conta Google",
          email: "google@example.com",
        },
      },
      token: {
        userId: "user_google",
      },
    });

    expect(signInResult).toBe(true);
    expect(syncGoogleUserMock).toHaveBeenCalledWith({
      providerAccountId: "google-account-123",
      email: "placeholder@example.com",
      name: "Placeholder",
      emailVerified: true,
      linkUserId: undefined,
    });
    expect(googleUser).toEqual({
      id: "user_google",
      email: "google@example.com",
      name: "Conta Google",
    });
    expect(sessionResult.user.id).toBe("user_google");
  });

  it("rejects Google sign-in when account sync fails", async () => {
    syncGoogleUserMock.mockRejectedValue(new Error("sync failed"));

    const result = await authConfig.callbacks.signIn({
      user: {
        id: "",
        email: "google@example.com",
        name: "Conta Google",
      },
      account: {
        provider: "google",
        providerAccountId: "google-account-123",
      },
      profile: {
        email_verified: true,
      },
    });

    expect(result).toBe(false);
    expect(loggerMock.error).toHaveBeenCalled();
  });

  it("redirects to the sign-in page when Google needs an explicit link", async () => {
    syncGoogleUserMock.mockRejectedValue(
      new AppError(
        "Vinculo necessario.",
        "ACCOUNT_LINK_REQUIRED",
        409,
      ),
    );

    const result = await authConfig.callbacks.signIn({
      user: {
        id: "",
        email: "google@example.com",
        name: "Conta Google",
      },
      account: {
        provider: "google",
        providerAccountId: "google-account-123",
      },
      profile: {
        email_verified: true,
      },
    });

    expect(result).toBe("/entrar?error=ACCOUNT_LINK_REQUIRED");
  });

  it("re-exports the auth helpers returned by NextAuth", () => {
    expect(authModule.handlers).toBeDefined();
    expect(authModule.auth).toBeDefined();
    expect(authModule.signIn).toBeDefined();
    expect(authModule.signOut).toBeDefined();
  });
});
