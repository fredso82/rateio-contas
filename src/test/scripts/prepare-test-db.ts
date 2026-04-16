import { execFileSync } from "node:child_process";

import { Client } from "pg";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://rateio:rateio@localhost:5432/rateio_contas_test?schema=public";

function getDatabaseName(connectionUrl: URL) {
  return connectionUrl.pathname.replace(/^\//, "");
}

function getAdminDatabaseUrl(connectionUrl: URL) {
  const adminUrl = new URL(connectionUrl.toString());
  adminUrl.pathname = "/postgres";
  adminUrl.searchParams.delete("schema");
  return adminUrl;
}

async function ensureDatabaseExists() {
  const connectionUrl = new URL(testDatabaseUrl);
  const databaseName = getDatabaseName(connectionUrl);

  if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) {
    throw new Error(`Nome de banco de teste inválido: ${databaseName}`);
  }

  const adminClient = new Client({
    connectionString: getAdminDatabaseUrl(connectionUrl).toString(),
  });

  await adminClient.connect();

  const result = await adminClient.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [databaseName],
  );

  if (result.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${databaseName}"`);
  }

  await adminClient.end();
}

async function main() {
  await ensureDatabaseExists();

  execFileSync(
    "npx",
    [
      "prisma",
      "migrate",
      "deploy",
      "--schema",
      "src/server/db/prisma/schema.prisma",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: testDatabaseUrl,
      },
    },
  );
}

main().catch((error) => {
  console.error("Falha ao preparar o banco de teste:", error);
  process.exitCode = 1;
});
