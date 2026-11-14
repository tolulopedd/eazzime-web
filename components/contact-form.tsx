"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { services } from "@/lib/content";
export function ContactForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const submission = useRef<{ body: string; id: string } | null>(null);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("service");
    if (s && services.some((x) => x.slug === s)) setSelected(s);
    const industry = p.get("industry");
    if (industry)
      setMessage(`I’d like to discuss a technology solution for ${industry}.`);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    setStatus("loading");
    const data = new FormData(form);
    const fields = Object.fromEntries(data.entries());
    fields.service =
      services.find((s) => s.slug === fields.service)?.title || fields.service;
    const body = JSON.stringify(fields);
    if (!submission.current || submission.current.body !== body) {
      submission.current = { body, id: crypto.randomUUID() };
    }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, requestId: submission.current.id }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true)
        throw new Error("Submission failed");
      setStatus("success");
      form.reset();
      setSelected("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  }
  return (
    <form
      name="contact"
      method="POST"
      action="/api/contact"
      onSubmit={submit}
      className="contact-form"
    >
      <p className="honeypot" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <h2>Tell us what you have in mind.</h2>
      <p className="form-intro">
        A new idea, an existing challenge, or a question. We’re listening.
      </p>
      <div className="form-grid">
        <label>
          Name <span>*</span>
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Your full name"
          />
        </label>
        <label>
          Company
          <input
            name="company"
            autoComplete="organization"
            maxLength={150}
            placeholder="Company name"
          />
        </label>
        <label>
          Email <span>*</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@company.com"
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            placeholder="Include country code"
          />
        </label>
        <label className="full">
          Service interested in
          <select
            name="service"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Select a service (optional)</option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}
              </option>
            ))}
            <option value="not-sure">I’d like some guidance</option>
          </select>
        </label>
        <label className="full">
          Message <span>*</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would you like to build or improve?"
          />
        </label>
      </div>
      <p className="form-privacy">
        We’ll use these details to respond to your enquiry. Read our{" "}
        <a href="/privacy/">Privacy Policy</a>. Fields marked * are required.
      </p>
      <button
        className="button"
        type="submit"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? (
          <>
            <LoaderCircle className="spin" size={18} />
            Sending…
          </>
        ) : status === "success" ? (
          <>
            Message sent
            <CheckCircle2 size={18} />
          </>
        ) : (
          <>
            Send Message
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <div aria-live="polite" role="status">
        {status === "success" && (
          <p className="form-feedback success">
            Thank you. Your message has been sent. We’ll get back to you using
            the contact details you provided.
          </p>
        )}
        {status === "error" && (
          <p className="form-feedback error">
            Your message could not be sent. Please try again shortly. You can
            also email <a href="mailto:info@eazzime.com">info@eazzime.com</a>.
          </p>
        )}
      </div>
    </form>
  );
}
