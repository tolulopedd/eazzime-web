"use client";
import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  ExternalLink,
  Download,
  LogOut,
  Search,
  X,
  ArrowRight,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { services } from "@/lib/content";
import { SecurityCheck } from "./security-check";
import { salesResponse } from "@/lib/sales-response";
const statuses = [
  "New",
  "Qualified",
  "Consultation Scheduled",
  "Proposal Sent",
  "Negotiation",
  "Won",
  "Lost",
];
type Lead = {
  id: string;
  created_at: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  description: string;
  service: string;
  status: string;
  budget: string;
  currency: string;
  start_date: string;
  timeline: string;
  assigned_to: string | null;
  summary: string;
  summary_kind: string;
  attribution: Record<string, string>;
  expires_at: string;
  consent_at: string;
  consent_version: string;
};
type Staff = { user_id: string; display_name: string; role: "admin" | "sales" };
type Settings = { welcome: string; faqs: string; knowledge: string };
type Data = {
  staff: Staff;
  team: Staff[];
  leads: Lead[];
  hasMore: boolean;
  metrics: {
    total: number;
    won: number;
    groups: {
      dimension: string;
      label: string;
      total: number;
      won: number;
      scheduled: number;
    }[];
  };
  settings?: Settings;
};
type Detail = {
  lead: Lead;
  conversations: {
    id: string;
    created_at: string;
    summary: string;
    summary_kind: string;
    messages: { role: string; content: string }[];
    details: Record<string, unknown>;
  }[];
  notes: { id: string; body: string; created_at: string; author_id: string }[];
  mail: {
    id: string;
    kind: string;
    sent_at: string | null;
    first_attempt_at: string | null;
    attempts: number;
  }[];
};
async function api(query = "", body?: Record<string, unknown>) {
  const response = await fetch(
    `/api/sales/admin${query}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : { cache: "no-store" },
  );
  return salesResponse(response);
}
export default function SalesAdmin() {
  const [data, setData] = useState<Data | null>(null),
    [detail, setDetail] = useState<Detail | null>(null),
    [auth, setAuth] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [service, setService] = useState(""),
    [page, setPage] = useState(0),
    [token, setToken] = useState(""),
    [version, setVersion] = useState(0),
    [settings, setSettings] = useState(false);
  const params = new URLSearchParams({
    q,
    status,
    service,
    page: String(page),
  }).toString();
  const handleError = useCallback((e: unknown) => {
    if (e instanceof Error) {
      if ("status" in e && e.status === 401) {
        setError("");
        setAuth(false);
        setData(null);
        setDetail(null);
      } else setError(e.message);
    } else setError("Please try again.");
  }, []);
  const load = useCallback(async () => {
    try {
      const result = await api("?" + params);
      setData(result);
      setAuth(true);
      setError("");
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [params, handleError]);
  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(timer);
  }, [load]);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const response = await fetch("/api/sales/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, challenge: token }),
      });
      try {
        await salesResponse(response);
      } catch (error) {
        if (error instanceof Error) setError(error.message);
        return;
      }
      await load();
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
      setToken("");
      setVersion((v) => v + 1);
    }
  }
  async function openLead(id: string) {
    setBusy(true);
    setError("");
    try {
      setDetail(await api("?id=" + id));
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }
  async function mutate(body: Record<string, unknown>, message = "Saved.") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api("", body);
      if (detail && body.action !== "delete")
        setDetail(await api("?id=" + detail.lead.id));
      if (body.action === "delete") setDetail(null);
      await load();
      setNotice(message);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }
  async function exportCsv() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        "/api/sales/admin?" + params + "&export=csv",
      );
      if (!response.ok) await salesResponse(response);
      if (!response.headers.get("content-type")?.includes("text/csv")) {
        throw new Error(
          "The lead export is unavailable. Please try again later.",
        );
      }
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "eazzime-leads.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      handleError(e);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`sales-admin ${auth ? "sales-workspace" : "sales-signin"}`}>
      {auth && <aside className="sales-sidebar">
        <a href="/" className="sales-brand" aria-label="EazziMe website">
          <img src="/brand/logo-dark.png" alt="EazziMe Technologies Inc." width="190" height="70" />
        </a>
        <p className="sales-sidebar-label">SALES WORKSPACE</p>
        <nav aria-label="Sales workspace">
          <a href="#workspace-overview" onClick={() => setSettings(false)}><LayoutDashboard size={19} /> Overview</a>
          <a href="#workspace-leads" onClick={() => setSettings(false)}><Users size={19} /> Sales leads</a>
          {data?.staff.role === "admin" && <button onClick={() => {
            setSettings(true);
            setTimeout(() => document.getElementById("workspace-settings")?.scrollIntoView({ behavior: "smooth" }), 0);
          }}><SlidersHorizontal size={19} /> Assistant settings</button>}
        </nav>
        <div className="sales-sidebar-bottom">
          {data && <div className="sales-staff"><span>{data.staff.display_name?.slice(0, 1) || "E"}</span><div><strong>{data.staff.display_name}</strong><small>{data.staff.role === "admin" ? "Administrator" : "Sales representative"}</small></div></div>}
          <a href="/"><ExternalLink size={16} /> Visit website</a>
        </div>
      </aside>}
      <div className="sales-workspace-content" id="workspace-overview">
        <div className="sales-admin-heading">
          <div>
            {auth && <p className="eyebrow">EAZZIME · SALES WORKSPACE</p>}
            <h1>{auth ? "Sales overview" : "Eazzime Sales Management"}</h1>
            <p className="sales-heading-description">{auth ? "Conversations into opportunities. Manage your pipeline and next steps." : "Sign in to manage your leads and customer conversations."}</p>
          </div>
          {auth && (
            <button
              onClick={async () => {
                try {
                  await api("", { action: "logout" });
                  setAuth(false);
                  setData(null);
                  setDetail(null);
                } catch (e) {
                  handleError(e);
                }
              }}
            >
              <LogOut size={17} /> Sign out
            </button>
          )}
        </div>
        {error && (
          <p role="alert" className="sales-error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="sales-notice">
            {notice}
          </p>
        )}
        {loading ? (
          <p role="status">Loading workspace…</p>
        ) : !auth ? (
          <form className="sales-login sales-lead-form" onSubmit={login}>
            <h2>Sales team sign-in</h2>
            <p>Access is restricted to authorized staff only.</p>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={200}
                required
              />
            </label>
            <SecurityCheck onToken={setToken} version={version} />
            <button className="sales-primary" disabled={busy || !token}>
              {busy ? "Signing in…" : "Sign in securely"}
              <ArrowRight size={17} />
            </button>
            <p>For password recovery, contact your workspace administrator.</p>
          </form>
        ) : (
          data && (
            <>
              <p className="sales-admin-user">
                {data.staff.display_name} ·{" "}
                {data.staff.role === "admin"
                  ? "Administrator"
                  : "Assigned leads only"}
              </p>
              <div className="sales-metrics">
                <article>
                  <small>Total leads</small>
                  <strong>{data.metrics.total}</strong>
                </article>
                <article>
                  <small>Won opportunities</small>
                  <strong>{data.metrics.won}</strong>
                </article>
                <article>
                  <small>Lead-to-won conversion</small>
                  <strong>
                    {data.metrics.total
                      ? Math.round(
                          (data.metrics.won / data.metrics.total) * 100,
                        )
                      : 0}
                    %
                  </strong>
                </article>
              </div>
              <div className="sales-toolbar">
                <label>
                  <Search size={17} />
                  <input
                    aria-label="Search name, email or company"
                    placeholder="Search leads…"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(0);
                    }}
                  />
                </label>
                <select
                  aria-label="Filter status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All statuses</option>
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <select
                  aria-label="Filter service"
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    setPage(0);
                  }}
                >
                  <option value="">All services</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
                {data.staff.role === "admin" && (
                  <>
                    <button onClick={exportCsv} disabled={busy}>
                      <Download size={17} /> CSV
                    </button>
                  </>
                )}
              </div>
              {settings && data.staff.role === "admin" && (
                <form
                  id="workspace-settings"
                  className="sales-settings sales-lead-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void mutate(
                      {
                        action: "settings",
                        ...Object.fromEntries(new FormData(e.currentTarget)),
                      },
                      "Assistant content updated.",
                    );
                  }}
                >
                  <h2>Verified assistant content</h2>
                  <p>
                    Base services and projects come from the website. Add
                    verified facts and FAQs here. Never include personal
                    information, secrets, or instructions that contradict
                    company policy.
                  </p>
                  <label>
                    Welcome message
                    <textarea
                      name="welcome"
                      defaultValue={data.settings?.welcome}
                      maxLength={300}
                      required
                    />
                  </label>
                  <label>
                    Frequently asked questions and answers
                    <textarea
                      name="faqs"
                      rows={7}
                      defaultValue={data.settings?.faqs}
                      maxLength={12000}
                    />
                  </label>
                  <label>
                    Additional verified knowledge and source URLs
                    <textarea
                      name="knowledge"
                      rows={7}
                      defaultValue={data.settings?.knowledge}
                      maxLength={16000}
                    />
                  </label>
                  <button className="sales-primary" disabled={busy}>
                    Save assistant content
                  </button>
                </form>
              )}
              <div id="workspace-leads" className="sales-table-wrap">
                <table className="sales-table">
                  <caption className="sr-only">
                    Sales leads, page {page + 1}
                  </caption>
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Received</th>
                      <th>
                        <span className="sr-only">Review</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leads.map((lead) => (
                      <tr key={lead.id}>
                        <td data-label="Contact">
                          <strong>{lead.name}</strong>
                          <small>{lead.company || lead.email}</small>
                        </td>
                        <td data-label="Service">
                          {services.find((s) => s.slug === lead.service)
                            ?.title || "To discuss"}
                        </td>
                        <td data-label="Status">
                          <span className="sales-status">{lead.status}</span>
                        </td>
                        <td data-label="Owner">
                          {data.team.find((s) => s.user_id === lead.assigned_to)
                            ?.display_name || "Unassigned"}
                        </td>
                        <td data-label="Received">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </td>
                        <td data-label="Review">
                          <button
                            disabled={busy}
                            onClick={() => openLead(lead.id)}
                            aria-label={`Review ${lead.name}`}
                          >
                            Review <ArrowRight size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!data.leads.length && (
                      <tr>
                        <td colSpan={6}>No leads match these filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="sales-pagination">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span>Page {page + 1}</span>
                <button
                  disabled={!data.hasMore}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
              <details className="sales-report">
                <summary>
                  Conversion by service, campaign & traffic source
                </summary>
                <p>
                  All leads you can access, independent of table filters.
                  Conversion = Won ÷ total leads. “Scheduled” counts the current
                  status.
                </p>
                <div id="workspace-leads" className="sales-table-wrap">
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>Dimension</th>
                        <th>Group</th>
                        <th>Leads</th>
                        <th>Scheduled</th>
                        <th>Won</th>
                        <th>Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.metrics.groups.map((g, i) => (
                        <tr key={i}>
                          <td>{g.dimension}</td>
                          <td>{g.label}</td>
                          <td>{g.total}</td>
                          <td>{g.scheduled}</td>
                          <td>{g.won}</td>
                          <td>
                            {g.total ? Math.round((g.won / g.total) * 100) : 0}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              {detail && (
                <section className="sales-detail" aria-label="Selected lead">
                  <div className="sales-detail-heading">
                    <h2>{detail.lead.name}</h2>
                    <button
                      onClick={() => setDetail(null)}
                      aria-label="Close lead details"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <p>
                    {detail.lead.company} ·{" "}
                    <a href={`mailto:${detail.lead.email}`}>
                      {detail.lead.email}
                    </a>
                    {detail.lead.phone && ` · ${detail.lead.phone}`}
                  </p>
                  <p className="sales-detail-description">
                    {detail.lead.description}
                  </p>
                  <dl className="sales-detail-facts">
                    {[
                      [
                        "Budget",
                        [detail.lead.budget, detail.lead.currency]
                          .filter(Boolean)
                          .join(" "),
                      ],
                      ["Preferred start", detail.lead.start_date],
                      ["Delivery window", detail.lead.timeline],
                      [
                        "Consent recorded",
                        new Date(detail.lead.consent_at).toLocaleString(),
                      ],
                      [
                        "Scheduled deletion",
                        new Date(detail.lead.expires_at).toLocaleDateString(),
                      ],
                    ].map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value || "Not provided"}</dd>
                      </div>
                    ))}
                  </dl>
                  <form
                    className="sales-toolbar"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const values = Object.fromEntries(
                        new FormData(e.currentTarget),
                      );
                      void mutate({
                        action: "update",
                        id: detail.lead.id,
                        status: values.status,
                        ...(data.staff.role === "admin"
                          ? { assigned_to: values.assigned_to || null }
                          : {}),
                      });
                    }}
                    key={
                      detail.lead.id +
                      detail.lead.status +
                      (detail.lead.assigned_to || "")
                    }
                  >
                    <label>
                      Status
                      <select name="status" defaultValue={detail.lead.status}>
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    {data.staff.role === "admin" && (
                      <label>
                        Assigned representative
                        <select
                          name="assigned_to"
                          defaultValue={detail.lead.assigned_to || ""}
                        >
                          <option value="">Unassigned</option>
                          {data.team.map((s) => (
                            <option key={s.user_id} value={s.user_id}>
                              {s.display_name}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <button className="sales-primary" disabled={busy}>
                      Update lead
                    </button>
                  </form>
                  <h3>Enquiries & conversation history</h3>
                  {detail.conversations.map((c) => (
                    <details key={c.id}>
                      <summary>
                        {new Date(c.created_at).toLocaleString()} ·{" "}
                        {c.summary_kind === "ai"
                          ? "AI summary — review against transcript"
                          : "Visitor description"}
                      </summary>
                      <p className="sales-summary">{c.summary}</p>
                      <dl className="sales-detail-facts">
                        {[
                          "description",
                          "service",
                          "budget",
                          "currency",
                          "startDate",
                          "timeline",
                          "name",
                          "company",
                          "email",
                          "phone",
                        ].map((k) => (
                          <div key={k}>
                            <dt>{k}</dt>
                            <dd>{String(c.details[k] || "Not provided")}</dd>
                          </div>
                        ))}
                      </dl>
                      {c.messages.map((m, i) => (
                        <p key={i} className="sales-summary">
                          <strong>
                            {m.role === "user" ? "Visitor" : "AI assistant"}:
                          </strong>{" "}
                          {m.content}
                        </p>
                      ))}
                    </details>
                  ))}
                  <details>
                    <summary>Original attribution</summary>
                    <dl className="sales-detail-facts">
                      {Object.entries(detail.lead.attribution).map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v || "Not provided"}</dd>
                        </div>
                      ))}
                    </dl>
                  </details>
                  <h3>Follow-up notes</h3>
                  {detail.notes.map((n) => (
                    <article className="sales-note" key={n.id}>
                      <small>
                        {new Date(n.created_at).toLocaleString()} ·{" "}
                        {data.team.find((s) => s.user_id === n.author_id)
                          ?.display_name || "Team member"}
                      </small>
                      <p>{n.body}</p>
                    </article>
                  ))}
                  <form
                    className="sales-lead-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = e.currentTarget;
                      void mutate(
                        {
                          action: "note",
                          id: detail.lead.id,
                          note: new FormData(f).get("note"),
                        },
                        "Follow-up note added.",
                      );
                      f.reset();
                    }}
                  >
                    <label>
                      Add a follow-up note
                      <textarea
                        name="note"
                        rows={3}
                        maxLength={4000}
                        required
                      />
                    </label>
                    <button className="sales-primary" disabled={busy}>
                      Save note
                    </button>
                  </form>
                  <h3>Email delivery</h3>
                  {detail.mail.map((m) => (
                    <p key={m.id}>
                      {m.kind}:{" "}
                      {m.sent_at
                        ? "Sent"
                        : m.attempts >= 6 ||
                            (m.first_attempt_at &&
                              Date.now() -
                                new Date(m.first_attempt_at).getTime() >
                                20 * 3600000)
                          ? "Needs attention"
                          : "Queued / retrying"}{" "}
                      · {m.attempts} attempts
                    </p>
                  ))}
                  {data.staff.role === "admin" && (
                    <div className="sales-toolbar">
                      <button
                        disabled={busy}
                        onClick={() =>
                          mutate(
                            { action: "retryMail", id: detail.lead.id },
                            "Unsent notifications queued for the next scheduled run.",
                          )
                        }
                      >
                        Retry unsent emails
                      </button>
                      <button
                        className="sales-delete"
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Permanently delete this lead, all enquiries, notes and queued emails? This cannot be undone.",
                            )
                          )
                            void mutate(
                              { action: "delete", id: detail.lead.id },
                              "Lead and associated records deleted.",
                            );
                        }}
                      >
                        <Trash2 size={16} /> Delete lead
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )
        )}
      </div>
    </section>
  );
}
