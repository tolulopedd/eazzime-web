import { createHmac, timingSafeEqual } from "node:crypto";
import {
  json,
  createStore,
  safely,
  verifyToken,
  text,
} from "../lib/sales-core.mjs";
export const config = {
  path: "/api/sales/booking",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
export function createHandler({
  env = process.env,
  db = createStore(env),
} = {}) {
  return safely(async (req) => {
    if (new URL(req.url).pathname !== config.path)
      return json({ error: "Not found" }, 404);
    if (req.method !== "POST")
      return json({ error: "Method not allowed" }, 405);
    if (!env.CAL_WEBHOOK_SECRET) return json({ error: "Not configured" }, 503);
    const raw = await req.text();
    if (Buffer.byteLength(raw) > 48000)
      return json({ error: "Too large" }, 413);
    const signature = req.headers.get("x-cal-signature-256") || "";
    const expected = createHmac("sha256", env.CAL_WEBHOOK_SECRET)
      .update(raw)
      .digest("hex");
    if (
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    )
      return json({ error: "Invalid signature" }, 403);
    let event;
    try {
      event = JSON.parse(raw);
    } catch {
      return json({ error: "Invalid payload" }, 400);
    }
    if (event.triggerEvent !== "BOOKING_CREATED")
      return json({ ok: true, ignored: true });
    const receipt = event.payload?.metadata?.leadReceipt;
    if (!receipt) return json({ ok: true, ignored: true });
    // Only configured confirmed bookings, never requested/pending bookings.
    if (event.payload.status !== "ACCEPTED")
      return json({ ok: true, ignored: true });
    const sid = verifyToken(receipt, env);
    await db("rpc/confirm_sales_booking", {
      method: "POST",
      body: JSON.stringify({
        sid,
        booking_id: text(event.payload.uid, 200, true),
      }),
    });
    return json({ ok: true });
  });
}
export default createHandler();
