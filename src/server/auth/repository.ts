import { compare, hash } from "bcryptjs";
import { AuthProvider } from "@prisma/client";

import { AppError } from "@/lib/errors";
import { getDisplayName, normalizeEmail } from "@/lib/utils";
import { prisma } from "@/server/db/client";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export async function verifyCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const authAccount = await prisma.authAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.credentials,
        providerAccountId: normalizedEmail,
      },
    },
    include: {
      user: true,
    },
  });

  if (!authAccount?.passwordHash) {
    return null;
  }

  const matches = await compare(password, authAccount.passwordHash);

  if (!matches) {
    return null;
  }

  return {
    id: authAccount.user.id,
    name: authAccount.user.name,
    email: authAccount.user.email,
  } satisfies AuthUser;
}

export async function registerCredentialsUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("Este email já está em uso.", "EMAIL_IN_USE", 409);
  }

  const passwordHash = await hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      authAccounts: {
        create: {
          provider: AuthProvider.credentials,
          providerAccountId: normalizedEmail,
          passwordHash,
        },
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  } satisfies AuthUser;
}

export async function syncGoogleUser(input: {
  providerAccountId: string;
  email: string | null | undefined;
  name: string | null | undefined;
}) {
  const providerAccount = await prisma.authAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.google,
        providerAccountId: input.providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  if (providerAccount) {
    return {
      id: providerAccount.user.id,
      name: providerAccount.user.name,
      email: providerAccount.user.email,
    } satisfies AuthUser;
  }

  if (!input.email) {
    throw new AppError(
      "Não foi possível concluir a autenticação com Google sem um email.",
      "GOOGLE_EMAIL_REQUIRED",
      400,
    );
  }

  const normalizedEmail = normalizeEmail(input.email);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    await prisma.authAccount.create({
      data: {
        userId: existingUser.id,
        provider: AuthProvider.google,
        providerAccountId: input.providerAccountId,
      },
    });

    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    } satisfies AuthUser;
  }

  const user = await prisma.user.create({
    data: {
      name: getDisplayName(input.name, normalizedEmail),
      email: normalizedEmail,
      authAccounts: {
        create: {
          provider: AuthProvider.google,
          providerAccountId: input.providerAccountId,
        },
      },
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  } satisfies AuthUser;
}

export async function getDashboardSnapshot(userId: string) {
  const [user, activePairsCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        pixKey: true,
      },
    }),
    prisma.pairMember.count({
      where: {
        userId,
        pair: {
          status: "active",
        },
      },
    }),
  ]);

  if (!user) {
    throw new AppError("Usuário não encontrado.", "USER_NOT_FOUND", 404);
  }

  return {
    user,
    activePairsCount,
  };
}
