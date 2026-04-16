import { hashSync } from "bcryptjs";
import { AuthProvider, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@rateiocontas.app";
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.info("Seed ignorado: usuário demo já existe.");
    return;
  }

  await prisma.user.create({
    data: {
      name: "Conta Demo",
      email,
      authAccounts: {
        create: {
          provider: AuthProvider.credentials,
          providerAccountId: email,
          passwordHash: hashSync("demo123456", 12),
        },
      },
    },
  });

  console.info(
    "Seed concluído. Usuário demo criado com email demo@rateiocontas.app.",
  );
}

main()
  .catch((error) => {
    console.error("Falha ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
