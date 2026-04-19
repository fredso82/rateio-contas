import { hashSync } from "bcryptjs";
import {
  AuthProvider,
  PairStatus,
  PeriodParticipantStatus,
  PeriodStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

async function upsertCredentialUser({
  email,
  name,
  password,
  pixKey,
}: {
  email: string;
  name: string;
  password: string;
  pixKey?: string;
}) {
  const passwordHash = hashSync(password, 12);

  const user = await prisma.user.upsert({
    where: {
      email,
    },
    update: {
      name,
      pixKey,
      profileCompletedAt: new Date("2026-04-16T09:00:00.000Z"),
    },
    create: {
      email,
      name,
      pixKey,
      profileCompletedAt: new Date("2026-04-16T09:00:00.000Z"),
    },
  });

  await prisma.authAccount.upsert({
    where: {
      provider_providerAccountId: {
        provider: AuthProvider.credentials,
        providerAccountId: email,
      },
    },
    update: {
      passwordHash,
      userId: user.id,
    },
    create: {
      userId: user.id,
      provider: AuthProvider.credentials,
      providerAccountId: email,
      passwordHash,
    },
  });

  return user;
}

async function ensureDemoActivePair(ownerId: string, guestId: string) {
  const existingPair = await prisma.pair.findFirst({
    where: {
      name: "Apê principal",
      createdByUserId: ownerId,
    },
    select: {
      id: true,
    },
  });

  if (existingPair) {
    return existingPair;
  }

  return prisma.pair.create({
    data: {
      name: "Apê principal",
      status: PairStatus.active,
      createdByUserId: ownerId,
      members: {
        create: [{ userId: ownerId }, { userId: guestId }],
      },
      periods: {
        create: [
          {
            label: "1 de abril de 2026",
            status: PeriodStatus.closed,
            openedByUserId: ownerId,
            openedAt: new Date("2026-04-01T12:00:00.000Z"),
            closedAt: new Date("2026-04-05T21:00:00.000Z"),
            participants: {
              create: [
                {
                  userId: ownerId,
                  status: PeriodParticipantStatus.closed,
                  closedAt: new Date("2026-04-05T20:30:00.000Z"),
                },
                {
                  userId: guestId,
                  status: PeriodParticipantStatus.closed,
                  closedAt: new Date("2026-04-05T21:00:00.000Z"),
                },
              ],
            },
            expenses: {
              create: [
                {
                  paidByUserId: ownerId,
                  description: "Supermercado do mês",
                  amountCents: 9400,
                  occurredOn: new Date("2026-04-02T12:00:00.000Z"),
                },
                {
                  paidByUserId: guestId,
                  description: "Internet",
                  amountCents: 3200,
                  occurredOn: new Date("2026-04-03T12:00:00.000Z"),
                },
              ],
            },
            settlement: {
              create: {
                totalAmountCents: 12600,
                sharePerPersonCents: 6300,
                payerUserId: guestId,
                receiverUserId: ownerId,
                transferAmountCents: 3100,
                calculatedAt: new Date("2026-04-05T21:00:00.000Z"),
              },
            },
          },
          {
            label: "15 de abril de 2026",
            status: PeriodStatus.open,
            openedByUserId: ownerId,
            openedAt: new Date("2026-04-15T12:00:00.000Z"),
            participants: {
              create: [{ userId: ownerId }, { userId: guestId }],
            },
            expenses: {
              create: [
                {
                  paidByUserId: ownerId,
                  description: "Gás",
                  amountCents: 1100,
                  occurredOn: new Date("2026-04-15T12:00:00.000Z"),
                },
                {
                  paidByUserId: guestId,
                  description: "Farmácia",
                  amountCents: 2600,
                  occurredOn: new Date("2026-04-16T12:00:00.000Z"),
                },
              ],
            },
          },
        ],
      },
    },
    select: {
      id: true,
    },
  });
}

async function ensureArchivedPair(ownerId: string, guestId: string) {
  const existingPair = await prisma.pair.findFirst({
    where: {
      name: "Viagem 2025",
      createdByUserId: ownerId,
    },
    select: {
      id: true,
    },
  });

  if (existingPair) {
    return existingPair;
  }

  return prisma.pair.create({
    data: {
      name: "Viagem 2025",
      status: PairStatus.archived,
      archivedAt: new Date("2026-03-01T12:00:00.000Z"),
      createdByUserId: ownerId,
      members: {
        create: [{ userId: ownerId }, { userId: guestId }],
      },
      periods: {
        create: {
          label: "18 de fevereiro de 2026",
          status: PeriodStatus.closed,
          openedByUserId: guestId,
          openedAt: new Date("2026-02-18T12:00:00.000Z"),
          closedAt: new Date("2026-02-22T20:00:00.000Z"),
          participants: {
            create: [
              {
                userId: ownerId,
                status: PeriodParticipantStatus.closed,
                closedAt: new Date("2026-02-22T19:30:00.000Z"),
              },
              {
                userId: guestId,
                status: PeriodParticipantStatus.closed,
                closedAt: new Date("2026-02-22T20:00:00.000Z"),
              },
            ],
          },
          expenses: {
            create: [
              {
                paidByUserId: ownerId,
                description: "Hotel",
                amountCents: 24000,
                occurredOn: new Date("2026-02-19T12:00:00.000Z"),
              },
              {
                paidByUserId: guestId,
                description: "Passeios",
                amountCents: 18000,
                occurredOn: new Date("2026-02-20T12:00:00.000Z"),
              },
            ],
          },
          settlement: {
            create: {
              totalAmountCents: 42000,
              sharePerPersonCents: 21000,
              payerUserId: guestId,
              receiverUserId: ownerId,
              transferAmountCents: 3000,
              calculatedAt: new Date("2026-02-22T20:00:00.000Z"),
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  });
}

async function main() {
  const [owner, guest] = await Promise.all([
    upsertCredentialUser({
      email: "demo@rateiocontas.app",
      name: "Fred Demo",
      password: "demo123456",
      pixKey: "fred-demo@pix",
    }),
    upsertCredentialUser({
      email: "parceira@rateiocontas.app",
      name: "Maya Demo",
      password: "demo123456",
      pixKey: "maya-demo@pix",
    }),
  ]);

  const [activePair, archivedPair] = await Promise.all([
    ensureDemoActivePair(owner.id, guest.id),
    ensureArchivedPair(owner.id, guest.id),
  ]);

  console.info("Seed concluído com sucesso.");
  console.info("Usuários de demonstração:");
  console.info(" - demo@rateiocontas.app / demo123456");
  console.info(" - parceira@rateiocontas.app / demo123456");
  console.info(`Dupla ativa preparada: ${activePair.id}`);
  console.info(`Dupla arquivada preparada: ${archivedPair.id}`);
}

main()
  .catch((error) => {
    console.error("Falha ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
