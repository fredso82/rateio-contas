import { describe, expect, it } from "vitest";

import { PeriodStatus } from "@prisma/client";

import { resolveUserPrimaryWorkspace } from "@/server/navigation/repository";

describe("resolveUserPrimaryWorkspace", () => {
  it("routes to the current period when the only active pair has an open period", () => {
    expect(
      resolveUserPrimaryWorkspace([
        {
          pairId: "pair_123",
          latestPeriodStatus: PeriodStatus.open,
        },
      ]),
    ).toEqual({
      kind: "pair_period",
      path: "/app/duplas/pair_123/periodo",
      pairId: "pair_123",
      periodStatus: PeriodStatus.open,
    });
  });

  it("routes to the current period when the only active pair is partially closed", () => {
    expect(
      resolveUserPrimaryWorkspace([
        {
          pairId: "pair_123",
          latestPeriodStatus: PeriodStatus.partially_closed,
        },
      ]),
    ).toEqual({
      kind: "pair_period",
      path: "/app/duplas/pair_123/periodo",
      pairId: "pair_123",
      periodStatus: PeriodStatus.partially_closed,
    });
  });

  it("routes to the pair detail when the only active pair has no active period", () => {
    expect(
      resolveUserPrimaryWorkspace([
        {
          pairId: "pair_123",
          latestPeriodStatus: PeriodStatus.closed,
        },
      ]),
    ).toEqual({
      kind: "pair_detail",
      path: "/app/duplas/pair_123",
      pairId: "pair_123",
    });

    expect(
      resolveUserPrimaryWorkspace([
        {
          pairId: "pair_456",
          latestPeriodStatus: null,
        },
      ]),
    ).toEqual({
      kind: "pair_detail",
      path: "/app/duplas/pair_456",
      pairId: "pair_456",
    });
  });

  it("falls back to the pairs list when there are no active pairs", () => {
    expect(resolveUserPrimaryWorkspace([])).toEqual({
      kind: "pairs_list",
      path: "/app/duplas",
    });
  });

  it("falls back to the pairs list when there is more than one active pair", () => {
    expect(
      resolveUserPrimaryWorkspace([
        {
          pairId: "pair_123",
          latestPeriodStatus: PeriodStatus.open,
        },
        {
          pairId: "pair_456",
          latestPeriodStatus: null,
        },
      ]),
    ).toEqual({
      kind: "pairs_list",
      path: "/app/duplas",
    });
  });
});
