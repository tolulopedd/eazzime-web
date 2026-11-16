import {
  json,
  problem,
  sameOrigin,
  readBody,
  messages,
  challenge,
  createStore,
  safely,
} from "../lib/sales-core.mjs";
import { ai, defaultWelcome } from "../lib/ai.mjs";
export const config = {
  path: "/api/sales/chat",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 20,
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
    if (req.method === "GET") {
      let settings;
      try {
        [settings] = await db("sales_settings?id=eq.1&select=welcome");
      } catch {
        /* fallback welcome still works without secrets */
      }
      return json({
        welcome: settings?.welcome || defaultWelcome,
        bookingEnabled: Boolean(env.CONSULTATION_BOOKING_URL),
        whatsapp: /^\d{8,15}$/.test(env.SALES_WHATSAPP || "")
          ? env.SALES_WHATSAPP
          : "",
      });
    }
    if (req.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    sameOrigin(req);
    const body = await readBody(req);
    if (body.aiConsent !== true)
      throw problem("Please agree to AI processing before chatting.");
    const history = messages(body.messages);
    if (!history.length || history.at(-1).role !== "user")
      throw problem("Enter a message.");
    await challenge(body.challenge, req, env, send);
    const [settings] = await db("sales_settings?id=eq.1&select=*");
    return json({ reply: await ai(history, settings, env, send) });
  });
}
export default createHandler();
