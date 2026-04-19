import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.integration.test.ts"],
    setupFiles: ["src/test/setup/unit.setup.ts"],
    coverage: {
      enabled: false,
    },
  },
});
