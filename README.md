# EazziMe Technologies Inc.

A complete responsive corporate site built with Next.js App Router, React, TypeScript, Tailwind CSS 4, Framer Motion, and Lucide. Pages are pre-rendered as a static export for fast, simple Netlify hosting. A Netlify Function sends contact enquiries through Resend; its API key is server-only.

## Local setup

Requires Node.js 20.9+ (Node 22 recommended).

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Edit `.env.local` before building; public environment values are embedded during the build. Do not put secrets in any `NEXT_PUBLIC_` variable.

```sh
npm run build
npm run typecheck
npm test
```

Production output is in `out/`. The build uses Next.js’s supported Webpack option for compatibility with this development environment. Since this project uses static export, `next start` is not supported; `npm start` serves the export using Python 3. For a local production preview, run `python3 -m http.server 3000 --directory out`. The plain Next.js/static preview does not run Netlify Functions. Use Netlify Dev to test the full email flow.

## Brand and content

- `lib/content.ts`: company configuration, ten services, industries, solution concepts, and process steps.
- `app/globals.css`: responsive design tokens, layout, and original product illustrations.
- `public/brand/`: supplied PNG logos for light and dark surfaces, preserving their exact typography. Original SVG files are retained for reference; they contain unembedded Poppins font text and should not be displayed directly without outlining.
- `app/icon.svg`: supplied brand mark.
- `public/social-share.png`: 1200 × 630 social sharing image.
- `components/`: shared navigation, footer, motion, cards, product visual, and form.
- `app/services/[slug]` and `app/solutions/[slug]`: reusable detail page layouts.

The SVG assets use **#0B203B** and **#16B7A7**. The exact logo teal intentionally takes precedence over the approximate #16B3A7 in the brief. Darker teal is used for small text on light surfaces for readability.

The UI takes structural inspiration from https://readymadesolution.com (clear service positioning, product presentation, delivery process, and contact CTAs). No reference-site code, imagery, client claims, or testimonials are used. All application mockups are original HTML/SVG illustrations. Concepts are clearly identified, with no fabricated clients or performance statistics.

## Environment configuration

| Variable                      | Purpose                                                                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`        | Final canonical origin, including https://; required before launch for metadata and sitemap. Defaults to an explicitly reserved `.example` placeholder. |
| `NEXT_PUBLIC_CONTACT_EMAIL`   | Optional public contact email. Omitted from UI when empty.                                                                                              |
| `NEXT_PUBLIC_CONTACT_PHONE`   | Optional public phone number.                                                                                                                           |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | Optional office address.                                                                                                                                |
| `NEXT_PUBLIC_LINKEDIN_URL`    | Optional full LinkedIn company URL.                                                                                                                     |

## Netlify deployment and Resend

1. Deploy this repository using Netlify’s Git integration. The build command is `npm run build`, publish directory is `out`, and the functions directory is `netlify/functions`. A static-folder-only upload does **not** deploy the email function.
2. Set `RESEND_API_KEY` in Netlify’s environment variables with **Functions** scope. Keep the key out of source control, chat, and all `NEXT_PUBLIC_` variables.
3. Set `RESEND_FROM_EMAIL` to an address on a domain verified in your Resend account, for example `EazziMe Website <website@eazzime.com>`. Verify `eazzime.com` in Resend before using this example. The visitor’s email is used as Reply-To, never as the sender.
4. Set the public domain/contact environment values above, then deploy/redeploy. Environment variables for functions must be set through Netlify’s UI, CLI, or API, not `[build.environment]` in `netlify.toml`.
5. Submit a test enquiry on the deployed site. Confirm Resend reports delivery and the message arrives at **info@eazzime.com**. The success response means Resend accepted the email; it does not independently prove inbox delivery.

The form submits JSON to `/api/contact`. The Netlify Function validates fields, limits payload size, checks browser origin, drops honeypot submissions, and uses a Netlify rate limit of five requests per IP/domain per three minutes. Plain-text email avoids HTML injection. The recipient is fixed server-side. Request IDs plus payload hashes prevent duplicate mail on retries. Provider errors and secrets are not returned to visitors or logged. This replaces Netlify Forms; form detection and Netlify Forms notifications are no longer required.

For full local integration testing, use the official Netlify CLI (`netlify dev`) with the server environment variables available locally or through the linked Netlify site. `npm run dev` alone and `npm start` serve the UI without the email endpoint. Keep local credentials in an ignored `.env` file. Automated handler tests use mocked provider responses and send no email.

References: [Resend email API](https://resend.com/docs/api-reference/emails/send-email), [Netlify function environment variables](https://docs.netlify.com/build/functions/environment-variables/), [Netlify rate limits](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/).

## Before public launch

- Replace the site URL placeholder and supply public contact details.
- Review the clearly marked privacy draft: confirm jurisdiction, privacy contact, and retention practices with the company.
- Replace solution concepts with approved portfolio entries when actual project details are available. Keep concept labels on any remaining illustrative examples.
- Configure Resend, deploy the Netlify Function, and verify inbox delivery.

## Accessibility and performance

Semantic landmarks, a skip link, keyboard focus rings, labelled form controls, responsive navigation with Escape support, reduced-motion preferences, and image alternatives are included. Navigation remains usable on mobile. The static output, small local logo assets, system font stack, and CSS/SVG illustrations avoid remote image/font latency and large hero downloads. Formal WCAG certification and field Core Web Vitals require further deployed-site measurement; neither is claimed.

`npm test` checks exported internal links/assets, page headings/metadata, and the Resend handler (validation, fixed recipient, Reply-To, retries, and failures). Browser QA and remaining deployment checks are recorded in `QA.md`.

## AI sales assistant and sales workspace

The site now includes a consent-aware AI chatbot, a Supabase-backed lead workspace at `/admin/sales/`, Resend notifications, Cal.com booking confirmation support and opt-in GA4 events. See [SALES_SETUP.md](SALES_SETUP.md) for environment variables, database migration, staff provisioning, integration settings, security/retention behavior and Netlify deployment. Use [SALES_ACCEPTANCE.md](SALES_ACCEPTANCE.md) for live provider acceptance checks before launch.
