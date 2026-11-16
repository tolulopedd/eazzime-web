import {
  json,
  problem,
  sameOrigin,
  readBody,
  createStore,
  safely,
  text,
  uuid,
  statuses,
  csv,
} from "../lib/sales-core.mjs";
import {
  authenticate,
  requireAdmin,
  accessibleLead,
  sessionCookie,
} from "../lib/sales-auth.mjs";
export const config = {
  path: "/api/sales/admin",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 60,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
export function createHandler({
  env = process.env,
  send = fetch,
  db = createStore(env, send),
  auth = authenticate,
} = {}) {
  return safely(async (req) => {
    const url = new URL(req.url);
    if (url.pathname !== config.path) return json({ error: "Not found" }, 404);
    if (!["GET", "POST"].includes(req.method))
      return json({ error: "Method not allowed" }, 405);
    if (req.method === "POST") sameOrigin(req);
    const body = req.method === "POST" ? await readBody(req) : {};
    if (body.action === "logout")
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("", 0, req.url, env) });
    const staff = await auth(req, db, env, send);
    if (req.method === "GET") {
      if (url.searchParams.get("id")) {
        const lead = await accessibleLead(
          url.searchParams.get("id"),
          staff,
          db,
        );
        const [conversations, notes, mail] = await Promise.all([
          db(
            `sales_submissions?lead_id=eq.${lead.id}&order=created_at.desc&select=*`,
          ),
          db(
            `sales_notes?lead_id=eq.${lead.id}&order=created_at.desc&select=*`,
          ),
          db(
            `sales_outbox?lead_id=eq.${lead.id}&select=id,kind,sent_at,attempts,first_attempt_at`,
          ),
        ]);
        return json({ lead, conversations, notes, mail });
      }
      const q = text(url.searchParams.get("q"), 100).replace(
        /[^\p{L}\p{N}@. _-]/gu,
        "",
      );
      const status = url.searchParams.get("status");
      const service = text(url.searchParams.get("service"), 100);
      let filter =
        staff.role === "sales" ? `&assigned_to=eq.${staff.user_id}` : "";
      if (statuses.includes(status))
        filter += `&status=eq.${encodeURIComponent(status)}`;
      if (service && /^[a-z-]+$/.test(service))
        filter += `&service=eq.${service}`;
      if (q)
        filter += `&or=(name.ilike.*${encodeURIComponent(q)}*,email.ilike.*${encodeURIComponent(q)}*,company.ilike.*${encodeURIComponent(q)}*)`;
      if (url.searchParams.get("export") === "csv") {
        requireAdmin(staff);
        const rows = [];
        for (let offset = 0; offset <= 10000; offset += 500) {
          const batch = await db(
            `sales_leads?select=*&order=created_at.desc,id${filter}&limit=500&offset=${offset}`,
          );
          rows.push(...batch);
          if (batch.length < 500) break;
        }
        if (rows.length > 10000)
          throw problem("Narrow your filters to export at most 10,000 leads.");
        return new Response(csv(rows), {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": 'attachment; filename="eazzime-leads.csv"',
            "Cache-Control": "no-store",
          },
        });
      }
      const page = Math.max(
        0,
        Math.min(10000, Number(url.searchParams.get("page")) || 0),
      );
      const [leads, team, metrics, settings] = await Promise.all([
        db(
          `sales_leads?select=*&order=created_at.desc,id${filter}&limit=51&offset=${Math.floor(page) * 50}`,
        ),
        staff.role === "admin"
          ? db("sales_staff?select=*&order=display_name")
          : Promise.resolve([staff]),
        db("rpc/sales_metrics", {
          method: "POST",
          body: JSON.stringify({
            staff_id: staff.role === "sales" ? staff.user_id : null,
          }),
        }),
        staff.role === "admin"
          ? db("sales_settings?id=eq.1&select=*")
          : Promise.resolve([]),
      ]);
      return json({
        staff,
        leads: leads.slice(0, 50),
        hasMore: leads.length > 50,
        team,
        metrics,
        settings: settings[0],
      });
    }
    if (body.action === "settings") {
      requireAdmin(staff);
      await db("sales_settings?id=eq.1", {
        method: "PATCH",
        body: JSON.stringify({
          welcome: text(body.welcome, 300, true),
          faqs: text(body.faqs, 12000),
          knowledge: text(body.knowledge, 16000),
          updated_at: new Date().toISOString(),
        }),
      });
      return json({ ok: true });
    }
    const lead = await accessibleLead(body.id, staff, db);
    if (body.action === "delete") {
      requireAdmin(staff);
      await db(`sales_leads?id=eq.${lead.id}`, { method: "DELETE" });
      return json({ ok: true });
    }
    if (body.action === "note") {
      await db("sales_notes", {
        method: "POST",
        body: JSON.stringify({
          lead_id: lead.id,
          author_id: staff.user_id,
          body: text(body.note, 4000, true),
        }),
      });
      return json({ ok: true });
    }
    if (body.action === "update") {
      if (!statuses.includes(body.status))
        throw problem("Invalid lead status.");
      const patch = { status: body.status };
      if ("assigned_to" in body) {
        requireAdmin(staff);
        if (body.assigned_to !== null) {
          if (!uuid(body.assigned_to))
            throw problem("Invalid sales representative.");
          const [member] = await db(
            `sales_staff?user_id=eq.${body.assigned_to}&select=user_id`,
          );
          if (!member) throw problem("Sales representative not found.");
        }
        patch.assigned_to = body.assigned_to;
      }
      await db(`sales_leads?id=eq.${lead.id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      return json({ ok: true });
    }
    if (body.action === "retryMail") {
      requireAdmin(staff);
      // Idempotency is guaranteed by Resend for 24h. Do not automatically re-send old ambiguous deliveries.
      if (Date.now() - new Date(lead.created_at).getTime() > 20 * 3600000)
        throw problem(
          "This delivery needs manual review in Resend before retrying.",
        );
      await db(`sales_outbox?lead_id=eq.${lead.id}&sent_at=is.null`, {
        method: "PATCH",
        body: JSON.stringify({
          attempts: 0,
          locked_until: null,
          next_attempt_at: new Date().toISOString(),
        }),
      });
      return json({ ok: true });
    }
    throw problem("Unknown action.");
  });
}
export default createHandler();
