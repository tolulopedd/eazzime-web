import { createHmac, timingSafeEqual } from "node:crypto";
export const statuses = [
  "New",
  "Qualified",
  "Consultation Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];
export const json = (body, status = 200, headers = {}) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
export const problem = (message, status = 400) =>
  Object.assign(new Error(message), { status });
export function text(value, max = 200, required = false) {
  if (value == null && !required) return "";
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw problem("Please check your entries.");
  return value.trim();
}
export const uuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export async function readBody(req, max = 48000) {
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw problem("JSON required.", 415);
  const raw = await req.text();
  if (Buffer.byteLength(raw) > max) throw problem("Request is too large.", 413);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    throw problem("Invalid request.");
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw problem("Invalid request.");
  return body;
}
export function sameOrigin(req) {
  if (req.headers.get("origin") !== new URL(req.url).origin)
    throw problem("Request not permitted.", 403);
}
export function messages(value) {
  if (!Array.isArray(value) || value.length > 30)
    throw problem("Please start a new conversation.");
  let total = 0;
  const result = value.map((m) => {
    if (!m || !["user", "assistant"].includes(m.role))
      throw problem("Invalid conversation.");
    const content = text(m.content, 2500, true);
    total += content.length;
    return { role: m.role, content };
  });
  if (total > 22000) throw problem("Please start a new conversation.");
  return result;
}
export function leadFields(body, serviceIds) {
  if (body.consent !== true)
    throw problem("Please agree to save your enquiry.");
  if (!uuid(body.requestId)) throw problem("Invalid submission identifier.");
  const fields = {};
  for (const [key, max] of Object.entries({
    name: 100,
    company: 150,
    email: 254,
    phone: 40,
    description: 3000,
    service: 100,
    budget: 100,
    currency: 10,
    startDate: 100,
    timeline: 200,
  }))
    fields[key] = text(
      body[key],
      max,
      ["name", "email", "description"].includes(key),
    );
  fields.email = fields.email.toLowerCase();
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fields.email))
    throw problem("Enter a valid email address.");
  if (fields.service && !serviceIds.includes(fields.service))
    throw problem("Choose a listed service.");
  if (fields.currency && !/^[A-Z]{3}$/.test(fields.currency))
    throw problem("Use a three-letter currency code.");
  const attribution = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "landing_page",
    "referrer",
  ])
    attribution[key] = text(body.attribution?.[key], 250);
  // Paths only; never retain query strings that may contain personal information.
  attribution.landing_page = attribution.landing_page.split(/[?#]/)[0];
  return {
    ...fields,
    attribution,
    messages: messages(body.messages || []),
    consent_version: "2026-11-14",
    request_id: body.requestId,
  };
}
export function makeToken(id, env) {
  if (!env.LEAD_TOKEN_SECRET || env.LEAD_TOKEN_SECRET.length < 32)
    throw problem("Lead capture is not configured.", 503);
  const payload = Buffer.from(
    JSON.stringify({ id, exp: Date.now() + 7 * 86400000 }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", env.LEAD_TOKEN_SECRET).update(payload).digest("hex")}`;
}
export function verifyToken(token, env) {
  if (!env.LEAD_TOKEN_SECRET) throw problem("Unavailable.", 503);
  const [payload, signature] = text(token, 600, true).split(".");
  const expected = createHmac("sha256", env.LEAD_TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  if (
    !signature ||
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    throw problem("Invalid receipt.", 403);
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    throw problem("Invalid receipt.", 403);
  }
  if (!uuid(data.id) || data.exp < Date.now())
    throw problem("Receipt expired.", 403);
  return data.id;
}
export function csv(rows) {
  const cols = [
    "id",
    "created_at",
    "name",
    "company",
    "email",
    "phone",
    "service",
    "status",
    "budget",
    "currency",
    "start_date",
    "timeline",
    "source",
    "summary",
  ];
  const cell = (value) => {
    let s = String(value ?? "");
    if (/^[\s]*[=+@\-]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  return (
    "\uFEFF" +
    [cols, ...rows.map((r) => cols.map((c) => r[c]))]
      .map((r) => r.map(cell).join(","))
      .join("\r\n")
  );
}
export function createStore(env = process.env, send = fetch) {
  return async (path, options = {}) => {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
      throw problem("Sales service is not configured.", 503);
    const response = await send(`${env.SUPABASE_URL}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...options.headers,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok)
      throw problem("Sales service is temporarily unavailable.", 503);
    return response.status === 204 ? null : response.json();
  };
}
export async function challenge(token, req, env, send = fetch) {
  if (!env.TURNSTILE_SECRET_KEY)
    throw problem("Spam protection is not configured.", 503);
  const response = await send(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: text(token, 2048, true),
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  const result = await response.json();
  if (
    !response.ok ||
    !result.success ||
    result.hostname !== new URL(req.url).hostname ||
    result.action !== "sales"
  )
    throw problem("Please complete the security check again.", 403);
}
export const safely = (handler) => async (req, context) => {
  try {
    return await handler(req, context);
  } catch (e) {
    return json(
      {
        error: e.status
          ? e.message
          : "Something went wrong. Please try again or email info@eazzime.com.",
      },
      e.status || 500,
    );
  }
};
