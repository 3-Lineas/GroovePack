import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "logger/index": "src/logger/index.ts",
    "pipeline/pipeline": "src/pipeline/pipeline.ts",
    "pipeline/with-d1-transaction": "src/pipeline/with-d1-transaction.ts",
    "api-client/index": "src/api-client/index.ts",
    "api-action/index": "src/api-action/index.ts",
    "api-toast/index": "src/api-toast/index.ts",
    "i18n/index": "src/i18n/index.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  minify: false,
  sourcemap: true,
  external: ["hono", "hono/client", "@base-ui/react", "@base-ui/react/toast"],
});
