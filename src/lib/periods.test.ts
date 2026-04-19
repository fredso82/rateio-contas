import { describe, expect, it } from "vitest";

import { shouldShowInlineExpenseComposer } from "@/lib/periods";

describe("shouldShowInlineExpenseComposer", () => {
  it("shows the composer for the editable current period", () => {
    expect(
      shouldShowInlineExpenseComposer({
        isHistoricalView: false,
        canCreateExpense: true,
      }),
    ).toBe(true);
  });

  it("hides the composer for historical views", () => {
    expect(
      shouldShowInlineExpenseComposer({
        isHistoricalView: true,
        canCreateExpense: true,
      }),
    ).toBe(false);
  });

  it("hides the composer when the viewer can no longer create expenses", () => {
    expect(
      shouldShowInlineExpenseComposer({
        isHistoricalView: false,
        canCreateExpense: false,
      }),
    ).toBe(false);
  });
});
