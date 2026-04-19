import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  redirectMock,
  revalidatePathMock,
  saveUserProfileMock,
  loggerErrorMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  revalidatePathMock: vi.fn(),
  saveUserProfileMock: vi.fn(),
  loggerErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/server/profile/repository", () => ({
  saveUserProfile: saveUserProfileMock,
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
  saveProfile,
} from "@/server/profile/actions";
import { initialProfileActionState } from "@/server/profile/action-state";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("profile actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to sign-in when there is no session", async () => {
    authMock.mockResolvedValue(null);

    await expect(
      saveProfile(initialProfileActionState, buildFormData({})),
    ).rejects.toThrow("NEXT_REDIRECT:/entrar?callbackUrl=%2Fapp%2Fperfil");
  });

  it("returns field errors when the profile payload is invalid", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });

    const result = await saveProfile(
      initialProfileActionState,
      buildFormData({
        name: " ",
        pixKey: "",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.name).toContain(
      "Digite como você quer aparecer.",
    );
    expect(saveUserProfileMock).not.toHaveBeenCalled();
  });

  it("redirects to the dynamic app entry after the first profile completion", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
    saveUserProfileMock.mockResolvedValue({
      completedForTheFirstTime: true,
    });

    await expect(
      saveProfile(
        initialProfileActionState,
        buildFormData({
          name: "Conta Teste",
          pixKey: "pix@teste",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app");

    expect(saveUserProfileMock).toHaveBeenCalledWith("user_123", {
      name: "Conta Teste",
      pixKey: "pix@teste",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/app");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/perfil");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/duplas");
  });

  it("returns a success state when editing an existing profile", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_456",
      },
    });
    saveUserProfileMock.mockResolvedValue({
      completedForTheFirstTime: false,
    });

    const result = await saveProfile(
      initialProfileActionState,
      buildFormData({
        name: "Conta Atualizada",
        pixKey: "",
      }),
    );

    expect(result).toEqual({
      status: "success",
      message: "Perfil atualizado com sucesso.",
    });
  });
});
