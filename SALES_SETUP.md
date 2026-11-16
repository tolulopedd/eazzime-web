# AI sales assistant and lead workspace

## What is included

The floating EazziMe assistant is loaded separately from the site's main page bundle. It provides session history, opt-in AI processing, a once-per-session welcome after 22 seconds of engagement, service prompts, typing feedback, a lead form and human handover. `/admin/sales/` is a no-index static shell; **all data and mutations require authenticated server-side authorization**. Administrators manage all records/content, assign representatives, export filtered CSV, delete records and inspect notification delivery. Sales representatives see and update only assigned leads. Public registration does not grant access.

The website remains a Next.js static export on Netlify. Netlify Functions implement the backend; Supabase is the dedicated CRM database and authentication service. No database existed in the starting repository. No GA4 implementation was present in source; the adapter reuses `window.gtag` if an existing deployment supplies it. Nothing requires a browser-visible AI, Resend, or database key.

## Environment

Copy `.env.example` to your local ignored environment file. Never commit real secrets. For Netlify set server-only variables with **Functions scope** and the `NEXT_PUBLIC_*` variables with **Builds scope**, then rebuild/redeploy.

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Chat / AI summaries | Server-side OpenAI project key; set project spending limits |
| `OPENAI_MODEL` | Chat / AI summaries | Responses-compatible text model enabled in that project; no hardcoded model assumption |
| `SUPABASE_URL` | Sales features | HTTPS Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Sales features | Legacy server-only service-role API key; never an anon/browser key |
| `LEAD_TOKEN_SECRET` | Leads / booking | At least 32 characters; generate with `openssl rand -hex 32` |
| `TURNSTILE_SECRET_KEY` | Chat / leads / login | Cloudflare Turnstile server secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Chat / leads / login | Public matching Turnstile site key |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Notifications | Existing Resend settings; verify sender domain |
| `SALES_EMAIL` | Optional | Defaults to `info@eazzime.com` |
| `SALES_WHATSAPP` | Optional | International digits only, no `+`; blank hides the option |
| `CONSULTATION_BOOKING_URL` | Online booking | HTTPS URL of a **free 30-minute** event |
| `CAL_WEBHOOK_SECRET` | Confirmed booking | Secret configured on the Cal.com event webhook |
| `LEAD_RETENTION_DAYS` | Optional | Default 180, allowed effective range 1–730; update the published privacy policy if changed |
| `NEXT_PUBLIC_GA4_ID` | Optional | `G-...` ID when the site does not already provide gtag |
| `NEXT_PUBLIC_SITE_URL` | Existing SEO | Set to `https://eazzime.com` in production |

Without configuration the UI provides explicit error feedback and the direct email handover; it never claims AI, email or booking succeeded. Deploy previews should use separate database/API projects and test recipients, not production records.

## Supabase migration and staff access

1. Create a dedicated Supabase project in your chosen region. Apply the SQL files in `supabase/migrations/` in filename order with SQL Editor (or your Supabase CLI migration workflow). It creates staff, settings, leads, submissions/transcripts, notes, mail outbox, booking deduplication, capture/booking/mail/metrics RPCs, indexes, RLS and grants.
2. Disable public signup in Authentication settings. Create each staff user using Supabase Auth's administrative tools. Set a strong password using your normal secure credential process. Add their **Auth user UUID** to the staff table:

   ```sql
   insert into public.sales_staff(user_id, display_name, role)
   values ('REPLACE-WITH-AUTH-USER-UUID', 'Sales administrator', 'admin');
   -- Use role 'sales' for representatives.
   ```

3. Sign in at `/admin/sales/`. Passwords travel directly to the server handler and then Supabase Auth. A Secure, HttpOnly, SameSite=Strict cookie holds the session for at most an hour; users sign in again after expiration. No admin tokens are stored in local/session storage. Each API call verifies the token with Supabase and rechecks the staff table; removing a staff row revokes application access immediately.
4. Use Supabase's administrator password reset/recovery process when needed. Role provisioning is intentionally outside the public app. Sales reps cannot export all leads, edit chatbot content, assign owners or delete records. RLS denies direct browser access even if someone discovers the Supabase URL.

The migration is additive and does not alter existing website/contact data. Back up your database before applying migrations to a shared project. For rollback first remove the widget/backend deployment; do not drop sales tables containing live enquiries without a backup/export and an approved data-retention decision.

## Booking and human handover

Recommended provider: **Cal.com**. Configure a free 30-minute event, automatic confirmation, and a webhook scoped to that event:

- Subscriber: `https://eazzime.com/api/sales/booking`
- Trigger: **Booking Created**
- Signing secret: same value as `CAL_WEBHOOK_SECRET`
- Default JSON payload, including `payload.metadata`, `payload.uid`, `payload.status`.

The booking URL receives `metadata[leadReceipt]`, an expiring signed reference with no contact details. Cal.com returns it in the webhook. The handler verifies the raw-body HMAC, rejects unsigned requests, ignores non-confirmed events, and atomically deduplicates booking UIDs. The lead moves from New/Qualified to Consultation Scheduled; later pipeline stages are not overwritten. Test metadata round-tripping with your hosted Cal.com version before launch. A different HTTPS booking link works for handover, but requires a provider-specific signed webhook adapter for automatic confirmation tracking. Calendar cancellations/reschedules stay in the calendar; staff update pipeline status when appropriate.

A booking click never emits `chatbot_consultation_booked`. That event is emitted only when the visitor returns to the site and a server receipt check reports a confirmed booking, with analytics opt-in. It is therefore a consented **browser-observed subset**, not the authoritative total; database metrics are authoritative. Closed tabs, blocked analytics and cross-device bookings may not emit GA events. Receipt references expire after seven days; rotate the secret to invalidate existing receipts.

WhatsApp appears only if `SALES_WHATSAPP` is set to a verified team number. Email handover always links to `info@eazzime.com`. Chat contents are not automatically put into either outbound link.

## Email reliability and duplicates

Lead capture commits a transaction before sending mail. Lowercased email is unique; repeated enquiries attach a new submission to the same lead without overwriting first-touch attribution or original contact fields. A UUID makes retries of one submission idempotent. Only a newly created lead queues a sales notification and prospect acknowledgement, preventing repeated acknowledgement spam for duplicates. The dashboard retains subsequent enquiries.

`deliverMail` claims jobs with row locks, sends both messages immediately, and uses stable Resend idempotency keys. The scheduled `sales-maintenance` function retries every 15 minutes, up to six attempts. Jobs stay visible after failure and can be retried in the admin dashboard within 20 hours. Review old ambiguous deliveries in Resend manually: its idempotency guarantee is time-limited. “Saved” means persisted in the database; it does not promise delivery to an inbox. Monitor failed/exhausted jobs and Netlify scheduled-function failures.

## Analytics and attribution

Events: `chatbot_open`, `chatbot_conversation_started`, `chatbot_service_selected`, `chatbot_lead_qualified`, `chatbot_lead_generated`, `chatbot_consultation_booked`, `chatbot_human_handoff`.

Analytics is opt-in in the widget and disabled by default. An existing gtag function is reused; otherwise the optional GA4 ID is loaded only after consent. Do not load a second GA tag elsewhere. Configure your existing CMP to respect the same consent state before any other analytics tags fire. Disable enhanced measurement of form interactions/outbound URLs in this GA property if your other forms/URLs could carry personal information. This adapter sends only enumerated event names, allowlisted service slugs, a handover channel and the static page path; it strips query strings/referrers and never passes form values or conversation text.

Original landing path, referrer hostname and UTM fields are preserved in session storage on first visit and copied to the CRM only with enquiry consent. Campaign tags are **not** sent by this adapter to GA. Avoid putting personal information in campaign URLs. Conversion events deduplicate within the browser tab; new-lead events additionally depend on database `created=true`, so duplicate emails do not create new lead conversions. A qualified lead has a selected service, budget, currency and delivery window, in addition to the required name/email/description. Metrics in the dashboard show Won/total by service, campaign and source across accessible leads, not just the current filtered page.

## Knowledge and privacy operations

`npm run build` regenerates `netlify/lib/knowledge.json` from `lib/content.ts`. Edit website content there; FAQ, welcome and additional verified knowledge can be managed in the admin UI without rebuilding. Add source URLs and review factual claims before publishing. No fine-tuning is performed. The model receives verified context and instructions to decline unsupported pricing, schedules, guarantees and testimonials. It has no tools, database access or ability to send messages/book meetings. AI summaries are labelled and staff should verify against the saved transcript. Model responses still require live acceptance testing; grounding is not a guarantee against hallucination.

The Privacy Policy explains AI processing, session history, lead storage, processors, analytics choices, retention and deletion. Session history is saved only after AI consent; database persistence requires a separate unchecked consent checkbox. Retention defaults to 180 days and the scheduled worker deletes expired leads and dependent records. Deletion in the dashboard cascades immediately. For a full privacy request, also review delivered email, calendar/provider records and backups; deleting a database row cannot erase those copies. Establish your provider-specific retention and access processes before launch.

## Deployment and validation

```sh
npm ci
npm run typecheck
npm run build
npm test
npm run test:browser
```

Browser tests use installed Google Chrome (`channel: chrome`) and an isolated `.next-sales-test` directory on port 3100, so they do not stop an existing development server. Set an alternative Playwright browser/channel in `playwright.config.ts` for CI.

With server-only AI credentials loaded in your shell, `npm run eval:sales` runs eight synthetic live grounding checks and writes an ignored report to `qa/sales-ai-evaluation.json` for human review. This makes billable API requests; never paste credentials into source files.

Use Node 22 (`nvm use`, using the included `.nvmrc`; install it with `nvm install` if needed). Run `npm run dev:full` and open `http://localhost:8888/admin/sales/` to preview the built site with Netlify Functions. This command builds the site first, then starts Netlify CLI; the first run downloads the CLI. Restart it after frontend edits to rebuild the static pages. Keep local credentials in an ignored `.env` file for Netlify Dev (and public build settings in `.env.local` if needed); never commit credentials. The usual `npm run dev` at port 3000 supports frontend hot reload but does not execute Netlify Functions. An HTML 404 at `/api/sales/admin` on that frontend-only server is not an authentication failure. Production uses `netlify.toml`, publish directory `out`, Node 22, and the Functions directory. Scheduled cleanup/retries run automatically **only on published Netlify deployments**, not local dev or previews. Invoke the scheduled function manually in a preview to check it. CSP permits only the required Turnstile/GA hosts in addition to the existing site policy.

Before enabling real traffic, configure services and run `SALES_ACCEPTANCE.md`, including real AI answers, real database permissions, delivered email, signed booking callbacks and GA DebugView. Automated tests use synthetic contacts and mocked external APIs, plus a local PostgreSQL-compatible migration test; they cannot establish that production credentials, sender reputation, provider settings or event webhooks are correct.

References: [OpenAI Responses API](https://developers.openai.com/api/reference/resources/responses/methods/create), [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Cal.com webhooks](https://cal.com/docs/developing/guides/automation/webhooks), [Netlify Functions](https://docs.netlify.com/build/functions/api/).
