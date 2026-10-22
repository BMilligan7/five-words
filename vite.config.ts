import vinext from "vinext";
import { defineConfig } from "vite";
process.env.CLOUDFLARE_CF_FETCH_ENABLED ??= "false";
process.env.WRANGLER_SEND_METRICS ??= "false";
process.env.WRANGLER_WRITE_LOGS ??= "false";
process.env.WRANGLER_LOG_PATH ??= ".local-runtime/logs";
process.env.WRANGLER_REGISTRY_PATH ??= ".local-runtime/dev-registry";
process.env.MINIFLARE_REGISTRY_PATH ??= ".local-runtime/registry";
export default defineConfig(async () => {
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    server: { host: "127.0.0.1" },
    plugins: [vinext(), cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      inspectorPort: false,
      config: {
        name: "five-words-local", main: "./worker.ts",
        compatibility_date: "2026-05-15", compatibility_flags: ["nodejs_compat"],
        d1_databases: [{ binding: "DB", database_name: "five-words-local", database_id: "00000000-0000-4000-8000-000000000000" }],
        r2_buckets: [{ binding: "BUCKET", bucket_name: "five-words-local-photos" }],
      },
    })],
  };
});
