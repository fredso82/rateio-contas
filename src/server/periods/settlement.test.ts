import { describe, expect, it } from "vitest";

import { calculateSettlement } from "@/server/periods/settlement";

describe("calculateSettlement", () => {
  it("returns who should pay when one participant spent more", () => {
    const result = calculateSettlement(
      [{ userId: "user_a" }, { userId: "user_b" }],
      [
        { paidByUserId: "user_a", amountCents: 6000 },
        { paidByUserId: "user_b", amountCents: 2000 },
      ],
    );

    expect(result).toMatchObject({
      totalAmountCents: 8000,
      sharePerPersonCents: 4000,
      transferAmountCents: 2000,
      payerUserId: "user_b",
      receiverUserId: "user_a",
      perParticipantTotals: {
        user_a: 6000,
        user_b: 2000,
      },
    });
  });

  it("handles the inverse direction", () => {
    const result = calculateSettlement(
      [{ userId: "user_a" }, { userId: "user_b" }],
      [
        { paidByUserId: "user_a", amountCents: 1000 },
        { paidByUserId: "user_b", amountCents: 7000 },
      ],
    );

    expect(result.payerUserId).toBe("user_a");
    expect(result.receiverUserId).toBe("user_b");
    expect(result.transferAmountCents).toBe(3000);
  });

  it("returns a zero settlement when both sides already balanced out", () => {
    const result = calculateSettlement(
      [{ userId: "user_a" }, { userId: "user_b" }],
      [
        { paidByUserId: "user_a", amountCents: 4000 },
        { paidByUserId: "user_b", amountCents: 4000 },
      ],
    );

    expect(result.transferAmountCents).toBe(0);
    expect(result.payerUserId).toBeNull();
    expect(result.receiverUserId).toBeNull();
  });
});
