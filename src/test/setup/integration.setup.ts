import "@/test/setup/shared-env";

process.env.TEST_DATABASE_URL ??=
  "postgresql://rateio:rateio@localhost:5432/rateio_contas_test?schema=public";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
