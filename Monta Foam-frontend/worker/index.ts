import handler from "vinext/server/app-router-entry";
import { api } from "./api";
import type { AppEnv } from "./types";

const worker = {
  async fetch(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
    if (new URL(request.url).pathname.startsWith("/api/v1/")) return api.fetch(request, env, ctx);
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
