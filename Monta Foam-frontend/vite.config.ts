import vinext from "vinext";
import { defineConfig } from "vite";

const WORKER_URL = "https://monta-foam.montafoam.workers.dev";

export default defineConfig(async () => {
  process.env.NEXT_PUBLIC_SITE_URL ??= WORKER_URL;
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          name: "monta-foam",
          main: "./worker/index.ts",
          compatibility_date: "2026-09-04",
          compatibility_flags: ["nodejs_compat"],
          vars: {
            GOOGLE_CALLBACK_URL: `${WORKER_URL}/api/v1/auth/google/callback`,
            WHATSAPP_NUMBER: "201129437175",
          },
          d1_databases: [
            {
              binding: "DB",
              database_name: "monta-foam",
              database_id: "947cb0e2-38ae-4f85-ae7b-a97bb9f664a5",
            },
          ],
        },
      }),
    ],
  };
});
