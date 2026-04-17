import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { prisma } from "@/server/db/client";
import {
  getProfileSnapshot,
  saveUserProfile,
} from "@/server/profile/repository";
import { resetDatabase } from "@/test/helpers/database";

describe("profile repository integration", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it("returns an incomplete snapshot for a fresh user", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "profile@example.com",
      },
    });

    await expect(getProfileSnapshot(user.id)).resolves.toEqual({
      user: {
        id: user.id,
        name: "Conta Teste",
        email: "profile@example.com",
        pixKey: null,
        profileCompletedAt: null,
      },
      isProfileComplete: false,
    });
  });

  it("completes the profile on the first save", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "profile@example.com",
      },
    });

    const result = await saveUserProfile(user.id, {
      name: "Conta Atualizada",
      pixKey: "pix-chave",
    });

    expect(result.completedForTheFirstTime).toBe(true);
    expect(result.user.name).toBe("Conta Atualizada");
    expect(result.user.pixKey).toBe("pix-chave");
    expect(result.user.profileCompletedAt).toBeTruthy();
  });

  it("preserves the completion timestamp on later edits", async () => {
    const initialCompletion = new Date("2026-04-16T10:00:00.000Z");
    const user = await prisma.user.create({
      data: {
        name: "Conta Teste",
        email: "profile@example.com",
        profileCompletedAt: initialCompletion,
      },
    });

    const result = await saveUserProfile(user.id, {
      name: "Conta Final",
      pixKey: "",
    });

    expect(result.completedForTheFirstTime).toBe(false);
    expect(result.user.profileCompletedAt?.toISOString()).toBe(
      initialCompletion.toISOString(),
    );
    expect(result.user.pixKey).toBeNull();
  });
});
