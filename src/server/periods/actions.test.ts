import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  authMock,
  redirectMock,
  revalidatePathMock,
  openPeriodForPairMock,
  createExpenseForPeriodMock,
  updateExpenseForUserMock,
  deleteExpenseForUserMock,
  closePeriodParticipationMock,
  reopenPeriodMock,
  loggerErrorMock,
} = vi.hoisted(() => ({
  authMock: vi.fn(),
  redirectMock: vi.fn((destination: string) => {
    throw new Error(`NEXT_REDIRECT:${destination}`);
  }),
  revalidatePathMock: vi.fn(),
  openPeriodForPairMock: vi.fn(),
  createExpenseForPeriodMock: vi.fn(),
  updateExpenseForUserMock: vi.fn(),
  deleteExpenseForUserMock: vi.fn(),
  closePeriodParticipationMock: vi.fn(),
  reopenPeriodMock: vi.fn(),
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

vi.mock("@/server/periods/repository", () => ({
  openPeriodForPair: openPeriodForPairMock,
  createExpenseForPeriod: createExpenseForPeriodMock,
  updateExpenseForUser: updateExpenseForUserMock,
  deleteExpenseForUser: deleteExpenseForUserMock,
  closePeriodParticipation: closePeriodParticipationMock,
  reopenPeriod: reopenPeriodMock,
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
  closeViewerPeriodParticipation,
  createPeriodExpense,
  deletePeriodExpense,
  openPairPeriod,
  reopenViewerPeriod,
  updatePeriodExpense,
} from "@/server/periods/actions";
import { initialExpenseActionState } from "@/server/periods/action-state";

function buildFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

describe("period actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({
      user: {
        id: "user_123",
      },
    });
  });

  it("redirects to the period page after opening a period", async () => {
    await expect(
      openPairPeriod(
        buildFormData({
          pairId: "pair_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123/periodo");

    expect(openPeriodForPairMock).toHaveBeenCalledWith("pair_123", "user_123");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/duplas/pair_123");
  });

  it("returns field errors when the expense payload is invalid", async () => {
    const result = await createPeriodExpense(
      initialExpenseActionState,
      buildFormData({
        pairId: "pair_123",
        periodId: "period_123",
        description: " ",
        amount: "0",
        occurredOn: "2026-02-30",
      }),
    );

    expect(result.status).toBe("error");
    expect(
      "fieldErrors" in result ? result.fieldErrors?.description : undefined,
    ).toContain("Digite uma descrição para a despesa.");
    expect(createExpenseForPeriodMock).not.toHaveBeenCalled();
  });

  it("updates an expense and redirects back to the period page", async () => {
    await expect(
      updatePeriodExpense(
        initialExpenseActionState,
        buildFormData({
          pairId: "pair_123",
          expenseId: "expense_123",
          description: "Mercado",
          amount: "42,90",
          occurredOn: "2026-04-16",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123/periodo");

    expect(updateExpenseForUserMock).toHaveBeenCalledWith(
      "expense_123",
      "user_123",
      {
        description: "Mercado",
        amountCents: 4290,
        occurredOn: new Date("2026-04-16T12:00:00.000Z"),
      },
    );
  });

  it("deletes an expense and redirects back to the period page", async () => {
    await expect(
      deletePeriodExpense(
        buildFormData({
          pairId: "pair_123",
          expenseId: "expense_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123/periodo");

    expect(deleteExpenseForUserMock).toHaveBeenCalledWith(
      "expense_123",
      "user_123",
    );
  });

  it("closes the viewer participation and redirects back to the period page", async () => {
    await expect(
      closeViewerPeriodParticipation(
        buildFormData({
          pairId: "pair_123",
          periodId: "period_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123/periodo");

    expect(closePeriodParticipationMock).toHaveBeenCalledWith(
      "period_123",
      "user_123",
    );
  });

  it("reopens the latest closed period and redirects back to the workspace", async () => {
    await expect(
      reopenViewerPeriod(
        buildFormData({
          pairId: "pair_123",
          periodId: "period_123",
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/app/duplas/pair_123/periodo");

    expect(reopenPeriodMock).toHaveBeenCalledWith("period_123", "user_123");
  });
});
