import { PageHero } from "@/components/ui";
export const metadata = {
  alternates: { canonical: "/privacy/" },
  title: "Privacy Policy",
  description:
    "How EazziMe handles contact enquiries, AI conversations, consultation bookings and optional analytics.",
};
export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="PRIVACY"
        title="Your information deserves care."
        description="How we handle the information you choose to share."
      />
      <section className="section">
        <article className="container prose">
          <h2>Contact enquiries and sales support</h2>
          <p>
            EazziMe Technologies Inc., 11 Grey Heron Drive, Winnipeg, Manitoba,
            R3X 0R3, Canada, uses the information you provide to answer
            enquiries, assess project requirements, arrange consultations and
            manage the sales relationship. This can include your name, company,
            email, optional phone, service interest, project description, budget
            and preferred timing. Please do not submit payment details, identity
            documents, passwords, or other sensitive information.
          </p>
          <h2>AI assistant and your choices</h2>
          <p>
            The chatbot identifies itself as an AI assistant. Before sending a
            message, you choose whether to allow OpenAI to process your messages
            and the relevant conversation context. Responses are grounded in our
            website and approved company information, but may be inaccurate.
            Pricing, scope, capabilities and delivery commitments must be
            confirmed by our team.
          </p>
          <p>
            Chat history is kept in session storage in your browser tab after
            you agree. You can use “Clear conversation” to remove it and
            withdraw that chat consent. We do not save the transcript in our
            sales database unless you explicitly submit an enquiry and agree to
            storage, AI summarisation and follow-up. You may contact us by email
            instead of using AI.
          </p>
          <h2>Lead records and consultation bookings</h2>
          <p>
            When you submit a chatbot enquiry, we save the supplied details,
            conversation, summary, consent record, originating page and
            available campaign attribution in Supabase. The same email address
            is matched to an existing lead to avoid duplicate records, while new
            enquiries remain visible to our team. OpenAI may generate a summary
            for staff to review. Resend processes notifications to our team and
            an acknowledgement to you.
          </p>
          <p>
            If you choose to book, the configured external booking service
            processes the details you enter there. A signed enquiry reference
            links a confirmed booking to your enquiry. Booking and WhatsApp
            services have their own privacy terms. Opening a calendar link alone
            does not confirm a booking.
          </p>
          <h2>Service providers and security</h2>
          <p>
            Netlify hosts this website and its server-side handlers. Cloudflare
            Turnstile helps prevent automated abuse and may process technical
            browser and network information. Supabase provides lead storage and
            staff authentication, OpenAI provides AI processing, and Resend
            delivers email. These providers may process information outside your
            province or country under their own service and data-processing
            terms. Technical logs may include IP addresses and request metadata.
          </p>
          <p>
            AI requests are made with response storage disabled; this does not
            eliminate all provider retention. OpenAI’s applicable
            abuse-monitoring and account-level data controls still apply. Access
            to sales records is restricted to authorised staff: administrators
            manage the workspace, while sales representatives access assigned
            leads.
          </p>
          <h2>Optional analytics</h2>
          <p>
            Chatbot analytics are off until you opt in using the widget’s
            analytics checkbox. If enabled and configured, Google Analytics
            receives named chatbot interactions and a service category, without
            your name, email, phone, message content, or raw campaign
            parameters. We do not intentionally send personal information in
            these events. You can withdraw this consent using the same checkbox.
            Attribution used for sales reports is stored separately from Google
            Analytics. Your original landing page and campaign tags are retained
            within the browser session so later navigation does not overwrite
            them.
          </p>
          <h2>Retention, access and deletion</h2>
          <p>
            Sales database records are scheduled for deletion after 180 days by
            default, with a configurable retention period based on business
            requirements. Deletion includes linked conversations, summaries,
            notes and queued notifications. Authorised administrators can also
            delete a lead earlier. Copies already delivered by email, calendar
            records, provider logs and backups follow their separate retention
            policies and may require additional deletion requests.
          </p>
          <p>
            For access, corrections, withdrawal of consent or deletion, email{" "}
            <a href="mailto:info@eazzime.com">info@eazzime.com</a>. We may need
            to verify your identity before disclosing or changing a record.
            Withdrawing consent does not reverse processing already completed.
            Enquiry consent is for responding to your request, not for unrelated
            marketing.
          </p>
          <p>Last updated: November 14, 2026.</p>
        </article>
      </section>
    </>
  );
}
