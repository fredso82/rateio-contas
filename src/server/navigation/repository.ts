import { PairStatus, PeriodStatus } from "@prisma/client";

import { prisma } from "@/server/db/client";

type PrimaryWorkspaceCandidate = {
  pairId: string;
  latestPeriodStatus: PeriodStatus | null;
};

export type UserPrimaryWorkspace =
  | {
      kind: "pairs_list";
      path: "/app/duplas";
    }
  | {
      kind: "pair_detail";
      path: string;
      pairId: string;
    }
  | {
      kind: "pair_period";
      path: string;
      pairId: string;
      periodStatus: "open" | "partially_closed";
    };

export function resolveUserPrimaryWorkspace(
  candidates: PrimaryWorkspaceCandidate[],
): UserPrimaryWorkspace {
  if (candidates.length !== 1) {
    return {
      kind: "pairs_list",
      path: "/app/duplas",
    };
  }

  const [candidate] = candidates;

  if (
    candidate.latestPeriodStatus === PeriodStatus.open ||
    candidate.latestPeriodStatus === PeriodStatus.partially_closed
  ) {
    return {
      kind: "pair_period",
      path: `/app/duplas/${candidate.pairId}/periodo`,
      pairId: candidate.pairId,
      periodStatus: candidate.latestPeriodStatus,
    };
  }

  return {
    kind: "pair_detail",
    path: `/app/duplas/${candidate.pairId}`,
    pairId: candidate.pairId,
  };
}

export async function getUserPrimaryWorkspace(
  userId: string,
): Promise<UserPrimaryWorkspace> {
  const activePairs = await prisma.pair.findMany({
    where: {
      status: PairStatus.active,
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 2,
    select: {
      id: true,
      periods: {
        orderBy: [{ openedAt: "desc" }, { createdAt: "desc" }],
        take: 1,
        select: {
          status: true,
        },
      },
    },
  });

  return resolveUserPrimaryWorkspace(
    activePairs.map((pair) => ({
      pairId: pair.id,
      latestPeriodStatus: pair.periods[0]?.status ?? null,
    })),
  );
}
