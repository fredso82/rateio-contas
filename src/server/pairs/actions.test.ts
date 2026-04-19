import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  redirectMock,
  revalidatePathMock,
  createPairForUserMock,
  archivePairForUserMock,
  generateInviteForPairMock,
  loggerErrorMock,
  reactivatePairForUserMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  revalidatePathMock: vi.fn(),
  createPairForUserMock: vi.fn(),
  archivePairForUserMock: vi.fn(),
  generateInviteForPairMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  reactivatePairForUserMock: vi.fn(),
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

vi.mock("@/server/pairs/repository", () => ({
  archivePairForUser: archivePairForUserMock,
  createPairForUser: createPairForUserMock,
  reactivatePairForUser: reactivatePairForUserMock,
}));

vi.mock("@/server/invites/repository", () => ({
  generateInviteForPair: generateInviteForPairMock,
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
  archiveViewerPair,
  createPair,
  generatePairInvite,
  reactivateViewerPair,
} from "@/server/pairs/actions";
import { initialPairActionState } from "@/server/pairs/action-state";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("pair actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns field errors when creating a pair with invalid data", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });

    const result = await createPair(
      initialPairActionState,
      buildFormData({
        name: " ",
      }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.name).toContain("Digite um nome para a dupla.");
    expect(createPairForUserMock).not.toHaveBeenCalled();
  });

  it("creates a pair and redirects to the detail page", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
    createPairForUserMock.mockResolvedValue({
      id: "pair_123",
      name: "Casa",
    });

    await expect(
      createPair(
        initialPairActionState,
        buildFormData({
          name: "Casa",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123");

    expect(createPairForUserMock).toHaveBeenCalledWith("user_123", {
      name: "Casa",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/duplas");
  });

  it("generates an invite and redirects back to the pair detail", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
    generateInviteForPairMock.mockResolvedValue({
      token: "invite_123",
    });

    await expect(
      generatePairInvite(
        buildFormData({
          pairId: "pair_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123");

    expect(generateInviteForPairMock).toHaveBeenCalledWith(
      "pair_123",
      "user_123",
    );
  });

  it("archives a pair and revalidates both pair lists", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });

    await expect(
      archiveViewerPair(
        buildFormData({
          pairId: "pair_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123");

    expect(archivePairForUserMock).toHaveBeenCalledWith("pair_123", "user_123");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/duplas/arquivadas");
  });

  it("reactivates a pair and redirects back to the detail page", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });

    await expect(
      reactivateViewerPair(
        buildFormData({
          pairId: "pair_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123");

    expect(reactivatePairForUserMock).toHaveBeenCalledWith(
      "pair_123",
      "user_123",
    );
  });
});
