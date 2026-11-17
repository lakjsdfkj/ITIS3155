// ADDED: Run database integration tests serially in the local development DB.

import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",

    include: ["tests/**/*.vitest.ts"],

    fileParallelism: false,

    maxWorkers: 1,
  },
})
