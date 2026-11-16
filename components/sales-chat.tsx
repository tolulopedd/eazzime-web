"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUp,
  Check,
  Mail,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  X,
  CalendarDays,
} from "lucide-react";
import { services } from "@/lib/content";
import {
  analyticsConsent,
  firstAttribution,
  storageGet,
  storageSet,
  track,
} from "@/lib/chat-analytics";
import { SecurityCheck } from "./security-check";
type Message = { role: "user" | "assistant"; content: string };
type Receipt = { receipt: string; bookingUrl: string };
const defaultWelcome =
  "Hi, I’m Davine an Eazzime AI assistant. What would you like to ask, build or improve on?";
export default function SalesChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false),
    [nudge, setNudge] = useState(false),
    [welcome, setWelcome] = useState(defaultWelcome);
  const [history, setHistory] = useState<Message[]>([]),
    [draft, setDraft] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [consent, setConsent] = useState(false),
    [analytics, setAnalytics] = useState(false),
    [form, setForm] = useState(false),
    [token, setToken] = useState(""),
    [version, setVersion] = useState(0);
  const [receipt, setReceipt] = useState<Receipt | null>(null),
    [booked, setBooked] = useState(false),
    [whatsapp, setWhatsapp] = useState("");
  const [service, setService] = useState("");
  const request = useRef<{ body: string; id: string } | null>(null);
  const attribution = useRef<Record<string, string>>({});
  const launcher = useRef<HTMLButtonElement>(null),
    panel = useRef<HTMLElement>(null),
    end = useRef<HTMLDivElement>(null);
  const historyRef = useRef(history);
  historyRef.current = history;
  useEffect(() => {
    attribution.current = firstAttribution();
    try {
      const saved = JSON.parse(storageGet("eazzime-chat") || "null");
      if (saved?.consent && Array.isArray(saved.history)) {
        setConsent(true);
        setHistory(saved.history.slice(-30));
      }
      const r = JSON.parse(storageGet("eazzime-receipt") || "null");
      if (r?.receipt) setReceipt(r);
    } catch {
      /* ignore corrupt browser state */
    }
    if (storageGet("eazzime-analytics") === "true") {
      setAnalytics(true);
      analyticsConsent(true);
    }
    let engaged = false;
    const engage = () => {
      engaged = true;
    };
    window.addEventListener("pointerdown", engage);
    window.addEventListener("scroll", engage);
    window.addEventListener("keydown", engage);
    const timer = setTimeout(() => {
      if (
        engaged &&
        document.visibilityState === "visible" &&
        !storageGet("eazzime-nudged")
      ) {
        setNudge(true);
        storageSet("eazzime-nudged", "1");
      }
    }, 22000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", engage);
      window.removeEventListener("scroll", engage);
      window.removeEventListener("keydown", engage);
    };
  }, []);
  useEffect(() => {
    if (consent)
      storageSet("eazzime-chat", JSON.stringify({ consent, history }));
  }, [history, consent]);
  useEffect(() => {
    if (open) {
      end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [history, busy, open]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    fetch("/api/sales/chat")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setWelcome(data.welcome);
          setWhatsapp(data.whatsapp);
        }
      })
      .catch(() => {});
  }, [open]);
  useEffect(() => {
    if (!receipt) return;
    // Check on return from the calendar; no conversion event is fired for an outbound click.
    const check = () =>
      fetch("/api/sales/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receipt", receipt: receipt.receipt }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.booked) {
            setBooked(true);
            track("chatbot_consultation_booked", `booked:${receipt.receipt}`);
          }
        })
        .catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    void check();
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [receipt]);
  if (pathname.startsWith("/admin")) return null;
  function show() {
    setOpen(true);
    setNudge(false);
    storageSet("eazzime-nudged", "1");
    track("chatbot_open");
  }
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  function resetCheck() {
    setToken("");
    setVersion((v) => v + 1);
  }
  async function ask(content = draft) {
    if (!content.trim() || busy || !consent || !token) return;
    if (history.length >= 28) {
      setError("Start a new chat to keep talking, or send your enquiry below.");
      return;
    }
    const next: Message[] = [
      ...history,
      { role: "user", content: content.trim() },
    ];
    setBusy(true);
    setError("");
    setDraft("");
    setHistory(next);
    track("chatbot_conversation_started");
    try {
      const response = await fetch("/api/sales/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          aiConsent: true,
          challenge: token,
        }),
        signal: AbortSignal.timeout(30000),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "Unable to reach the assistant.");
      setHistory([...next, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setHistory(history);
      setDraft(content);
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
      resetCheck();
    }
  }
  async function capture(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !token) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const body = {
      ...data,
      consent: data.consent === "on",
      messages: historyRef.current,
      attribution: attribution.current,
    };
    const encoded = JSON.stringify(body);
    if (request.current?.body !== encoded)
      request.current = { body: encoded, id: crypto.randomUUID() };
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/sales/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          requestId: request.current.id,
          challenge: token,
        }),
        signal: AbortSignal.timeout(55000),
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(result.error || "Unable to save your enquiry.");
      const saved = { receipt: result.receipt, bookingUrl: result.bookingUrl };
      setReceipt(saved);
      storageSet("eazzime-receipt", JSON.stringify(saved));
      setForm(false);
      if (result.created)
        track("chatbot_lead_generated", `lead:${request.current.id}`, service);
      if (result.qualified)
        track(
          "chatbot_lead_qualified",
          `qualified:${request.current.id}`,
          service,
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
      resetCheck();
    }
  }
  return (
    <div className="sales-widget">
      {nudge && !open && (
        <div className="sales-nudge">
          <button aria-label="Dismiss welcome" onClick={() => setNudge(false)}>
            <X size={15} />
          </button>
          <p>Have an idea in mind?</p>
          <button onClick={show}>
            Let’s explore what’s possible <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      {open && (
        <section
          className="sales-panel"
          ref={panel}
          tabIndex={-1}
          role="dialog"
          aria-modal="false"
          aria-label="Davine @Eazzime — AI sales assistant"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <header className="sales-chat-header">
            <span className="sales-brand">
              <img src="/icon.svg" alt="" width="36" height="36" />
              <span>
                <strong>Davine @Eazzime</strong>
                <small>AI-powered · Human support available</small>
              </span>
            </span>
            <button onClick={close} aria-label="Close chat">
              <X size={20} />
            </button>
          </header>
          <div className="sales-chat-body">
            <div
              className="sales-transcript"
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions"
            >
              <p className="sales-message assistant">{welcome}</p>
              {history.map((message, i) => (
                <p className={`sales-message ${message.role}`} key={i}>
                  <span className="sr-only">
                    {message.role === "user" ? "You" : "AI assistant"}:{" "}
                  </span>
                  {message.content}
                </p>
              ))}
              {busy && (
                <p className="sales-typing" role="status">
                  <span />
                  <span />
                  <span />
                  <span className="sr-only">Working on your request</span>
                </p>
              )}
              <div ref={end} />
            </div>
            {!consent && (
              <div className="sales-consent">
                <ShieldCheck size={19} />
                <p>
                  Messages are processed by OpenAI to answer your questions.
                  Please avoid sensitive information. Chat history stays in this
                  browser tab until you send an enquiry.
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />{" "}
                  I agree to AI processing and tab-based chat history.{" "}
                  <a href="/privacy/">Privacy policy</a>
                </label>
              </div>
            )}
            {consent && !form && !receipt && history.length < 2 && (
              <div className="sales-quick">
                {[
                  ["Build an MVP", "custom-software"],
                  ["Explore AI automation", "ai-automation"],
                  ["Improve our data", "data-engineering"],
                ].map(([label, slug]) => (
                  <button
                    key={slug}
                    disabled={busy}
                    onClick={() => {
                      setDraft(label);
                      setService(slug);
                      track(
                        "chatbot_service_selected",
                        `service:${slug}`,
                        slug,
                      );
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {receipt && !form && (
              <div className="sales-receipt">
                <Check size={20} />
                <strong>
                  {booked ? "Consultation confirmed" : "Your enquiry is saved"}
                </strong>
                <p>
                  {booked
                    ? "Your calendar confirmation contains the meeting details."
                    : "Our sales team will review your enquiry. Email delivery may take a few minutes."}
                </p>
                {receipt.bookingUrl && !booked ? (
                  <a
                    className="sales-primary"
                    href={receipt.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Choose your free 30-minute consultation{" "}
                    <CalendarDays size={17} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  !booked && (
                    <p>
                      Email{" "}
                      <a href="mailto:info@eazzime.com">info@eazzime.com</a> to
                      arrange your free 30-minute consultation.
                    </p>
                  )
                )}
              </div>
            )}
            {form && (
              <form className="sales-lead-form" onSubmit={capture}>
                <h3>Let’s make a plan.</h3>
                <p>
                  Share what you know. Budget and timing can be discussed later.
                </p>
                <label>
                  Full name *
                  <input
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Company
                  <input
                    name="company"
                    autoComplete="organization"
                    maxLength={150}
                  />
                </label>
                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </label>
                <label>
                  Phone (optional)
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                  />
                </label>
                <label>
                  What would you like to build or improve? *
                  <textarea
                    name="description"
                    maxLength={3000}
                    rows={3}
                    required
                  />
                </label>
                <label>
                  Service
                  <select
                    name="service"
                    value={service}
                    onChange={(e) => {
                      setService(e.target.value);
                      track(
                        "chatbot_service_selected",
                        `service:${e.target.value}`,
                        e.target.value,
                      );
                    }}
                  >
                    <option value="">Help me decide</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sales-field-pair">
                  <label>
                    Estimated budget
                    <input
                      name="budget"
                      placeholder="e.g. 10,000–20,000"
                      maxLength={100}
                    />
                  </label>
                  <label>
                    Currency
                    <select
                      name="currency"
                      aria-label="Currency"
                      defaultValue=""
                    >
                      <option value="">Select</option>
                      {["CAD", "USD", "GBP", "EUR", "NGN"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>
                  Preferred start
                  <input
                    name="startDate"
                    placeholder="e.g. January 2027"
                    maxLength={100}
                  />
                </label>
                <label>
                  Desired delivery window
                  <input
                    name="timeline"
                    placeholder="e.g. Within six months"
                    maxLength={200}
                  />
                </label>
                <div className="sales-honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input name="website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>
                <label className="sales-checkbox">
                  <input type="checkbox" name="consent" required /> I agree to
                  EazziMe saving my details and this conversation, generating a
                  sales summary with AI, and contacting me about my enquiry.{" "}
                  <a href="/privacy/">Privacy policy</a>
                </label>
                <SecurityCheck onToken={setToken} version={version} />
                <button
                  type="submit"
                  className="sales-primary"
                  disabled={busy || !token}
                >
                  {busy
                    ? "Saving your enquiry…"
                    : "Send enquiry & book consultation"}
                </button>
                <button
                  type="button"
                  className="sales-text-button"
                  disabled={busy}
                  onClick={() => {
                    setForm(false);
                    resetCheck();
                  }}
                >
                  Back to conversation
                </button>
              </form>
            )}
            {error && (
              <p className="sales-error" role="alert">
                {error}
              </p>
            )}
          </div>
          {!form && (
            <div className="sales-chat-bottom">
              {consent && (
                <>
                  <form
                    className="sales-composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void ask();
                    }}
                  >
                    <label className="sr-only" htmlFor="sales-message">
                      Your message
                    </label>
                    <textarea
                      id="sales-message"
                      placeholder="Tell us about your idea…"
                      maxLength={2000}
                      rows={2}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      disabled={busy}
                    />
                    <button
                      type="submit"
                      aria-label="Send message"
                      disabled={busy || !token || !draft.trim()}
                    >
                      <ArrowUp size={20} />
                    </button>
                  </form>
                  <SecurityCheck onToken={setToken} version={version} />
                </>
              )}
              <button
                className="sales-primary"
                disabled={busy}
                onClick={() => {
                  setForm(true);
                  setError("");
                  resetCheck();
                }}
              >
                Book a Free 30-Minute Technology Consultation{" "}
                <CalendarDays size={17} />
              </button>
              <div className="sales-handoffs">
                <a
                  href="mailto:info@eazzime.com"
                  onClick={() =>
                    track(
                      "chatbot_human_handoff",
                      "handoff:email",
                      undefined,
                      "email",
                    )
                  }
                >
                  <Mail size={15} /> Email sales
                </a>
                {whatsapp && (
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      track(
                        "chatbot_human_handoff",
                        "handoff:whatsapp",
                        undefined,
                        "whatsapp",
                      )
                    }
                  >
                    <MessageCircle size={15} /> WhatsApp
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
                <button
                  disabled={busy}
                  onClick={() => {
                    setHistory([]);
                    setDraft("");
                    setConsent(false);
                    setError("");
                    storageSet("eazzime-chat", "");
                  }}
                  title="Clear conversation"
                >
                  <RotateCcw size={15} />
                  <span className="sr-only">
                    Clear conversation and AI consent
                  </span>
                </button>
              </div>
            </div>
          )}
          <label className="sales-analytics">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => {
                setAnalytics(e.target.checked);
                analyticsConsent(e.target.checked);
                if (e.target.checked) track("chatbot_open");
              }}
            />{" "}
            Allow anonymous chatbot analytics
          </label>
        </section>
      )}
      <button
        ref={launcher}
        className="sales-launcher"
        onClick={() => (open ? close() : show())}
        aria-expanded={open}
        aria-label={
          open ? "Close Davine @Eazzime" : "Chat with Davine @Eazzime"
        }
      >
        {open ? <X size={24} /> : <MessageCircle size={25} />}
        <span>{open ? "Close" : "Let’s build"}</span>
      </button>
    </div>
  );
}
