import { problem } from "./sales-core.mjs";
export const cookieName = "eazzime_sales";
export function sessionCookie(token = "", seconds = 0, requestUrl, env = process.env) {
  const url = requestUrl ? new URL(requestUrl) : null;
  // Safari does not accept Secure cookies on an HTTP localhost preview.
  // Require both Netlify's development flag and a loopback URL for this exception.
  const localPreview = env.NETLIFY_DEV === "true" && url?.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  return `${cookieName}=${token}; Path=/api/sales; HttpOnly;${localPreview ? "" : " Secure;"} SameSite=Strict; Max-Age=${seconds}`;
}
export async function authenticate(req, db, env = process.env, send = fetch) {
  const token = req.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(cookieName + "="))
    ?.slice(cookieName.length + 1);
  if (!token) throw problem("Please sign in.", 401);
  const response = await send(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok)
    throw problem("Your session expired. Please sign in again.", 401);
  const user = await response.json();
  if (!user.id || !/^[0-9a-f-]{36}$/i.test(user.id))
    throw problem("Please sign in.", 401);
  const [staff] = await db(`sales_staff?user_id=eq.${user.id}&select=*`);
  if (!staff || !["admin", "sales"].includes(staff.role))
    throw problem("Sales access is not enabled for this account.", 403);
  return staff;
}
export function requireAdmin(staff) {
  if (staff.role !== "admin")
    throw problem("Administrator access required.", 403);
}
export async function accessibleLead(id, staff, db) {
  const { uuid } = await import("./sales-core.mjs");
  if (!uuid(id)) throw problem("Invalid lead.");
  const [lead] = await db(
    `sales_leads?id=eq.${id}${staff.role === "sales" ? `&assigned_to=eq.${staff.user_id}` : ""}&select=*`,
  );
  if (!lead) throw problem("Lead not found.", 404);
  return lead;
}
