import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  redirectMock,
  acceptInviteMock,
  getClientIpMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  acceptInviteMock: vi.fn(),
  getClientIpMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/server/invites/repository", () => ({
  acceptInvite: acceptInviteMock,
}));

vi.mock("@/lib/request-context", () => ({
  getClientIp: getClientIpMock,
}));

import { acceptPendingInvite } from "@/server/invites/actions";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("invite actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getClientIpMock.mockResolvedValue("127.0.0.1");
  });

  it("redirects unauthenticated users back to sign-in", async () => {
    authMock.mockResolvedValue(null);

    await expect(
      acceptPendingInvite(
        buildFormData({
          token: "invite-token",
        }),
      ),
    ).rejects.toThrow(
      "NEXT_REDIRECT:/entrar?callbackUrl=%2Fconvite%2Finvite-token",
    );
  });

  it("accepts the invite only through the explicit action", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
    acceptInviteMock.mockResolvedValue({
      kind: "joined",
      pairId: "pair_123",
    });

    await expect(
      acceptPendingInvite(
        buildFormData({
          token: "invite-token",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123");

    expect(acceptInviteMock).toHaveBeenCalledWith("invite-token", "user_123");
  });
});
