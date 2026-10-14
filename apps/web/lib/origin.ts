import { safeOrigin as pure } from "@vidalo/core/shared";
import { env } from "./env";

/** The origin to return a visitor to (core/shared/origin.ts), with PUBLIC_BASE_URL as the fallback. */
export function safeOrigin(req: Request): string {
  return pure(req.headers, env.baseUrl);
}
