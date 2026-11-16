## Resend integration update

The contact form now uses `/api/contact` and a server-only Netlify Function. Automated tests mock Resend and cover successful submission, validation, honeypot handling, origin/method restrictions, fixed recipient, Reply-To, idempotent retries, missing configuration, and provider failures. No live message has been sent; deployment, verified sender configuration, and inbox delivery remain to be tested with the owner’s Resend account.

The earlier Netlify Forms notes below describe the original implementation and are superseded by this integration.

# Verification record

## Passed

- Production export: `npm run build` (Next.js 16, Webpack).
- Strict TypeScript: `npm run typecheck`.
- Automated tests: `npm test` (all exported internal links/assets, page heading/metadata/language/image alternatives, and form field registration).
- Browser: home layout visually inspected at desktop, phone, and tablet sizes.
- Horizontal overflow checks: home at 320, 390, and 768 pixels; contact at 320 and 390 pixels.
- Mobile menu opens; selecting Our Services navigates and closes it. Escape closes the menu and restores button focus.
- Additional 390px overflow checks passed for About, Industries, Solutions, an individual solution, and Data Analytics service.
- Custom Software Development card opens its detail page.
- Discuss Your Project opens contact and preselects Custom Software Development.
- Empty form submission focuses Name and identifies required Name, Email, and Message inputs.
- Valid local form submission produces explicit error feedback; no false success or external enquiry was sent.
- Browser logs showed no application errors during the exercised flow.
- Brand asset correction: original SVGs reference unembedded Poppins text. The provided PNG variants are used for visible logos to preserve typography across browsers.
- Social image visually inspected at 1200 × 630.

## Deployment-dependent checks

Actual Netlify Forms persistence, spam classification, email notifications, and success-path integration must be checked on the deployed Netlify site after enabling form detection. No live deployment or external form submission was performed.

The canonical domain, public contact details, privacy policy details, and real portfolio entries remain owner-configurable. Portfolio concepts are labelled and the privacy page is marked as a draft.

No formal accessibility certification, Lighthouse score, or field Core Web Vitals result is claimed. Browser testing used the available Chromium-based in-app browser; Safari, Firefox, and physical devices were not tested.

## AI sales assistant — November 14, 2026

- Production Next.js static export and TypeScript check pass with `/admin/sales/` excluded from indexing and sitemap inclusion.
- 25 Node tests pass: existing contact and exported-site checks, sales request validation, explicit consent, origin/route guards, Turnstile hostname/action checks, model context and error handling, receipt HMAC, admin authentication and role enforcement, notification idempotency, CSV escaping and policy/headers.
- The actual SQL migration was executed in PGlite (PostgreSQL WASM). Verified schema creation, public access denial, RPC grants, duplicate email/request handling, original attribution, outbox locks/retry limits, booking deduplication, scoped metrics and cascade deletion. This is not a substitute for applying and testing the migration in the target Supabase project.
- 12 Playwright checks pass using Chrome at desktop, iPhone-sized and 320px phone viewports. Verified consent flow, natural-language UI with mocked AI response, failed lead submission and retry, preserved input and request IDs, receipt display, optional analytics with no form/conversation data, no booking conversion before server confirmation, duplicate-event suppression, once-per-session engagement welcome, admin sign-in shell, enquiry review, notes and content editing. No horizontal document overflow detected.
- Desktop/mobile screenshots reviewed for widget and sales workspace. Existing contact, service and portfolio routes continue to build and link checks pass.
- External APIs are mocked in automated tests. No live OpenAI responses, actual Resend delivery, Supabase deployment, Cal.com metadata/webhook round-trip, GA DebugView events, or production Netlify rate limits/schedule have been verified without provider configuration. Follow `SALES_ACCEPTANCE.md` before launch; `npm run eval:sales` provides synthetic live AI prompts once credentials are supplied securely.
