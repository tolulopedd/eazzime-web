import {
  json,
  problem,
  sameOrigin,
  readBody,
  leadFields,
  challenge,
  createStore,
  safely,
  makeToken,
  verifyToken,
} from "../lib/sales-core.mjs";
import { ai, knowledge } from "../lib/ai.mjs";
import { deliverMail } from "../lib/mail.mjs";
export const config = {
  path: "/api/sales/lead",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 8,
    windowSize: 300,
    aggregateBy: ["ip", "domain"],
  },
};
export function createHandler({
  env = process.env,
  send = fetch,
  db = createStore(env, send),
} = {}) {
  return safely(async (req, context) => {
    if (new URL(req.url).pathname !== config.path)
      return json({ error: "Not found" }, 404);
    if (req.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    sameOrigin(req);
    const body = await readBody(req);
    if (body.action === "receipt") {
      const id = verifyToken(body.receipt, env);
      const [submission] = await db(
        `sales_submissions?id=eq.${id}&select=booked_at`,
      );
      return json({ booked: Boolean(submission?.booked_at) });
    }
    if (body.website) throw problem("Unable to accept this enquiry.");
    const fields = leadFields(
      body,
      knowledge.services.map((s) => s.slug),
    );
    const receipt = makeToken(fields.request_id, env);
    await challenge(body.challenge, req, env, send);
    // A failed AI summary must never prevent lead capture.
    fields.summary = fields.description;
    fields.summary_kind = "visitor";
    try {
      const [settings] = await db("sales_settings?id=eq.1&select=*");
      fields.summary = await ai(
        [{ role: "user", content: JSON.stringify(fields) }],
        settings,
        env,
        send,
        true,
      );
      fields.summary_kind = "ai";
    } catch {
      /* sales sees the original visitor description */
    }
    const result = await db("rpc/capture_sales_lead", {
      method: "POST",
      body: JSON.stringify({
        p: fields,
        retention_days: Number(env.LEAD_RETENTION_DAYS) || 180,
      }),
    });
    // Database commit precedes mail. Scheduled worker retries failed delivery.
    const delivery = deliverMail(db, env, send).catch(() => {});
    if (context?.waitUntil) context.waitUntil(delivery);
    else await delivery;
    let bookingUrl = "";
    if (env.CONSULTATION_BOOKING_URL) {
      try {
        const url = new URL(env.CONSULTATION_BOOKING_URL);
        if (url.protocol === "https:") {
          url.searchParams.set("metadata[leadReceipt]", receipt);
          bookingUrl = url.toString();
        }
      } catch {
        /* Misconfigured booking must not hide a successfully saved lead. */
      }
    }
    return json({
      ok: true,
      created: result.created,
      qualified: result.qualified,
      receipt,
      bookingUrl,
    });
  });
}
export default createHandler();
