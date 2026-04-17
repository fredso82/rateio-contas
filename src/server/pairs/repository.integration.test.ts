import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { PairStatus } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";
import {
  createPairForUser,
  getPairDetails,
  listUserPairs,
} from "@/server/pairs/repository";
import { resetDatabase } from "@/test/helpers/database";

describe("pair repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("creates a pair and includes the creator as first member", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "pairs@example.com",
      },
    });

    const pair = await createPairForUser(user.id, {
      name: "Casa",
    });

    const membership = await prisma.pairMember.findFirst({
      where: {
        pairId: pair.id,
        userId: user.id,
      },
    });

    expect(pair.name).toBe("Casa");
    expect(membership).toBeTruthy();
  });

  it("lists active and archived pairs separately", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "pairs@example.com",
      },
    });

    const [activePair, archivedPair] = await Promise.all([
      prisma.pair.create({
        data: {
          name: "Ativa",
          createdByUserId: user.id,
          status: PairStatus.active,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
      }),
      prisma.pair.create({
        data: {
          name: "Arquivada",
          createdByUserId: user.id,
          status: PairStatus.archived,
          members: {
            create: {
              userId: user.id,
            },
          },
        },
      }),
    ]);

    const result = await listUserPairs(user.id);

    expect(result.activePairs.map((pair) => pair.id)).toContain(activePair.id);
    expect(result.archivedPairs.map((pair) => pair.id)).toContain(
      archivedPair.id,
    );
  });

  it("returns pair details only for members", async () => {
    const [owner, stranger] = await Promise.all([
      prisma.user.create({
        data: {
          name: "Titular",
          email: "owner@example.com",
        },
      }),
      prisma.user.create({
        data: {
          name: "Visitante",
          email: "visitor@example.com",
        },
      }),
    ]);

    const pair = await prisma.pair.create({
      data: {
        name: "Casa",
        createdByUserId: owner.id,
        members: {
          create: {
            userId: owner.id,
          },
        },
      },
    });

    await expect(getPairDetails(pair.id, owner.id)).resolves.toMatchObject({
      pair: {
        id: pair.id,
        name: "Casa",
      },
      isIncomplete: true,
      isOwner: true,
    });

    await expect(getPairDetails(pair.id, stranger.id)).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
