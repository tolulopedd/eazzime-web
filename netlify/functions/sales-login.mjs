import {
  json,
  problem,
  sameOrigin,
  readBody,
  text,
  createStore,
  safely,
  challenge,
} from "../lib/sales-core.mjs";
import { sessionCookie } from "../lib/sales-auth.mjs";
export const config = {
  path: "/api/sales/login",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 5,
    windowSize: 300,
    aggregateBy: ["ip", "domain"],
  },
};
export function createHandler({
  env = process.env,
  send = fetch,
  db = createStore(env, send),
} = {}) {
  return safely(async (req) => {
    if (new URL(req.url).pathname !== config.path)
      return json({ error: "Not found" }, 404);
    if (req.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    sameOrigin(req);
    const body = await readBody(req, 6000);
    await challenge(body.challenge, req, env, send);
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
      throw problem("Admin sign-in is not configured.", 503);
    const response = await send(
      `${env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: text(body.email, 254, true),
          password: text(body.password, 200, true),
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok)
      throw problem("Unable to sign in. Check your credentials.", 401);
    const result = await response.json();
    const [staff] = await db(
      `sales_staff?user_id=eq.${result.user.id}&select=role`,
    );
    if (!staff)
      throw problem("Sales access is not enabled for this account.", 403);
    return json({ ok: true }, 200, {
      "Set-Cookie": sessionCookie(
        result.access_token,
        Math.min(result.expires_in || 3600, 3600),
        req.url,
        env,
      ),
    });
  });
}
export default createHandler();
