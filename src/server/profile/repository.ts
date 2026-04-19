import { AppError } from "@/lib/errors";
import { prisma } from "@/server/db/client";

export type ProfileFormInput = {
  name: string;
  pixKey?: string;
};

export async function getProfileSnapshot(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerifiedAt: true,
      pixKey: true,
      profileCompletedAt: true,
      authAccounts: {
        select: {
          provider: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("Usuário não encontrado.", "USER_NOT_FOUND", 404);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      pixKey: user.pixKey,
      profileCompletedAt: user.profileCompletedAt,
    },
    isProfileComplete: user.profileCompletedAt !== null,
    hasGoogleLinked: user.authAccounts.some(
      (account) => account.provider === "google",
    ),
  };
}

export async function saveUserProfile(userId: string, input: ProfileFormInput) {
  const snapshot = await getProfileSnapshot(userId);
  const now = new Date();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
      pixKey: input.pixKey?.trim() ? input.pixKey.trim() : null,
      profileCompletedAt: snapshot.user.profileCompletedAt ?? now,
    },
    select: {
      id: true,
      name: true,
      email: true,
      pixKey: true,
      profileCompletedAt: true,
    },
  });

  return {
    user,
    completedForTheFirstTime: snapshot.user.profileCompletedAt === null,
  };
}
