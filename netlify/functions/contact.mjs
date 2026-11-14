import { createHash } from "node:crypto";

export const config = {
  path: "/api/contact",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 5,
    windowSize: 180,
    aggregateBy: ["ip", "domain"],
  },
};
const respond = (status, body) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const fail = (status) => respond(status, { ok: false });

export function createHandler({ env = process.env, send = fetch } = {}) {
  return async (request) => {
    // Only the rate-limited public route can send mail.
    if (new URL(request.url).pathname !== "/api/contact") return fail(404);
    if (request.method !== "POST")
      return new Response(null, { status: 405, headers: { Allow: "POST" } });
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return fail(403);
    if (!request.headers.get("content-type")?.startsWith("application/json"))
      return fail(415);
    let body;
    try {
      const raw = await request.text();
      if (Buffer.byteLength(raw) > 24000) return fail(413);
      body = JSON.parse(raw);
    } catch {
      return fail(400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return fail(400);
    if (body["bot-field"]) return respond(200, { ok: true });
    const limits = {
      name: 100,
      company: 150,
      email: 254,
      phone: 40,
      service: 150,
      message: 5000,
    };
    const fields = {};
    for (const [key, max] of Object.entries(limits)) {
      const value = body[key] ?? "";
      if (typeof value !== "string" || value.length > max) return fail(400);
      fields[key] = value.trim();
    }
    if (
      !fields.name ||
      fields.message.length < 10 ||
      !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email)
    )
      return fail(400);
    if (!/^[a-f0-9-]{36}$/i.test(body.requestId ?? "")) return fail(400);
    if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return fail(503);
    const text = [
      "New EazziMe website enquiry",
      "",
      `Name: ${fields.name}`,
      `Company: ${fields.company || "Not provided"}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone || "Not provided"}`,
      `Service: ${fields.service || "Not specified"}`,
      "",
      "Message:",
      fields.message,
    ].join("\n");
    const idempotencyKey =
      "contact-" +
      createHash("sha256")
        .update(JSON.stringify([body.requestId, fields]))
        .digest("hex");
    try {
      const response = await send("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL,
          to: ["info@eazzime.com"],
          reply_to: fields.email,
          subject: "New enquiry — EazziMe website",
          text,
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) return fail(502);
      const result = await response.json();
      if (typeof result.id !== "string" || !result.id) return fail(502);
      return respond(200, { ok: true });
    } catch {
      return fail(502);
    }
  };
}
export default createHandler();
