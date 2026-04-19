import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { AuthProvider, PairStatus } from "@prisma/client";

import { AppError } from "@/lib/errors";
import {
  getDashboardSnapshot,
  registerCredentialsUser,
  syncGoogleUser,
  verifyCredentials,
} from "@/server/auth/repository";
import { prisma } from "@/server/db/client";
import { resetDatabase } from "@/test/helpers/database";

describe("auth repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("registers a credentials user with normalized email and hashed password", async () => {
    const user = await registerCredentialsUser({
      name: "Conta Teste",
      email: "  USER@example.com ",
      password: "12345678",
    });

    const authAccount = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.credentials,
          providerAccountId: "user@example.com",
        },
      },
    });

    expect(user).toMatchObject({
      name: "Conta Teste",
      email: "user@example.com",
    });
    expect(authAccount).toBeTruthy();
    expect(authAccount?.passwordHash).toBeTruthy();
    expect(authAccount?.passwordHash).not.toBe("12345678");
  });

  it("verifies credentials only when the password matches", async () => {
    const createdUser = await registerCredentialsUser({
      name: "Conta Teste",
      email: "user@example.com",
      password: "12345678",
    });

    await expect(
      verifyCredentials("user@example.com", "12345678"),
    ).resolves.toEqual({
      id: createdUser.id,
      name: "Conta Teste",
      email: "user@example.com",
    });

    await expect(
      verifyCredentials("user@example.com", "87654321"),
    ).resolves.toBeNull();
  });

  it("blocks implicit Google linking when a user with the same email already exists", async () => {
    const existingUser = await registerCredentialsUser({
      name: "Conta Existente",
      email: "casal@example.com",
      password: "12345678",
    });

    await expect(
      syncGoogleUser({
        providerAccountId: "google-account-123",
        email: "  CASAL@example.com ",
        name: "Outro Nome",
        emailVerified: true,
      }),
    ).rejects.toMatchObject({
      code: "ACCOUNT_LINK_REQUIRED",
      statusCode: 409,
    });

    const googleAccount = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.google,
          providerAccountId: "google-account-123",
        },
      },
    });

    expect(existingUser.email).toBe("casal@example.com");
    expect(googleAccount).toBeNull();
  });

  it("links Google explicitly for the authenticated user", async () => {
    const existingUser = await registerCredentialsUser({
      name: "Conta Existente",
      email: "casal@example.com",
      password: "12345678",
    });

    const syncedUser = await syncGoogleUser({
      providerAccountId: "google-account-123",
      email: "  CASAL@example.com ",
      name: "Outro Nome",
      emailVerified: true,
      linkUserId: existingUser.id,
    });

    const googleAccount = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: AuthProvider.google,
          providerAccountId: "google-account-123",
        },
      },
    });
    const refreshedUser = await prisma.user.findUnique({
      where: {
        id: existingUser.id,
      },
    });

    expect(syncedUser).toEqual({
      id: existingUser.id,
      name: "Conta Existente",
      email: "casal@example.com",
    });
    expect(googleAccount?.userId).toBe(existingUser.id);
    expect(refreshedUser?.emailVerifiedAt).toBeTruthy();
  });

  it("creates a new user from Google when the email does not exist yet", async () => {
    const syncedUser = await syncGoogleUser({
      providerAccountId: "google-account-456",
      email: "joao.silva@example.com",
      name: " ",
      emailVerified: true,
    });

    const createdUser = await prisma.user.findUnique({
      where: {
        email: "joao.silva@example.com",
      },
      include: {
        authAccounts: true,
      },
    });

    expect(syncedUser).toMatchObject({
      name: "joao silva",
      email: "joao.silva@example.com",
    });
    expect(createdUser?.authAccounts).toHaveLength(1);
    expect(createdUser?.authAccounts[0]?.provider).toBe(AuthProvider.google);
    expect(createdUser?.emailVerifiedAt).toBeTruthy();
  });

  it("returns the dashboard snapshot with only active pairs counted", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Snapshot",
        email: "snapshot@example.com",
      },
    });

    const [activePair, archivedPair] = await Promise.all([
      prisma.pair.create({
        data: {
          name: "Dupla ativa",
          status: PairStatus.active,
          createdByUserId: user.id,
        },
      }),
      prisma.pair.create({
        data: {
          name: "Dupla arquivada",
          status: PairStatus.archived,
          createdByUserId: user.id,
        },
      }),
    ]);

    await prisma.pairMember.createMany({
      data: [
        {
          pairId: activePair.id,
          userId: user.id,
        },
        {
          pairId: archivedPair.id,
          userId: user.id,
        },
      ],
    });

    const snapshot = await getDashboardSnapshot(user.id);

    expect(snapshot).toEqual({
      user: {
        id: user.id,
        name: "Conta Snapshot",
        email: "snapshot@example.com",
        emailVerifiedAt: null,
        pixKey: null,
      },
      activePairsCount: 1,
    });
  });

  it("throws an app error when the dashboard user does not exist", async () => {
    await expect(getDashboardSnapshot("missing_user")).rejects.toBeInstanceOf(
      AppError,
    );
    await expect(getDashboardSnapshot("missing_user")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      statusCode: 404,
    });
  });
});
