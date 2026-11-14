import { PageHero } from "@/components/ui";
export const metadata = {
  alternates: { canonical: "/privacy/" },
  title: "Privacy Policy",
  description:
    "How contact enquiries submitted through the EazziMe website are handled.",
};
export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="PRIVACY"
        title="Your information deserves care."
        description="How this website handles information you choose to share."
      />
      <section className="section">
        <article className="container prose">
          <h2>Contact enquiries</h2>
          <p>
            When you use our contact form, we collect the information you
            submit, including your name, email address, company, phone number,
            selected service, and message. We use it to review your enquiry and
            communicate with you about it. Please do not include sensitive
            personal or financial information.
          </p>
          <h2>Website and form services</h2>
          <p>
            This website is configured for hosting and form processing through
            Netlify, with Resend used to deliver enquiries by email. Form
            contents and your email address are processed by Resend for delivery
            to our team. Hosting infrastructure may process technical
            information, such as IP addresses and request logs, to deliver the
            website, protect against spam, and process submissions. No
            advertising trackers or analytics cookies are included in this
            website.
          </p>
          <h2>Access and retention</h2>
          <p>
            Enquiries should be accessible only to people who need them to
            respond and manage the relationship. Information should be kept only
            as long as needed for those purposes and applicable obligations.
          </p>
          <h2>Your questions</h2>
          <p>
            To ask about your information, request a correction, or request
            deletion, please use our <a href="/contact/">contact form</a> and
            identify the enquiry concerned.
          </p>
          <p className="editorial-note">
            Policy draft: the company’s privacy contact, retention schedule, and
            applicable jurisdiction must be confirmed before public launch.
          </p>
        </article>
      </section>
    </>
  );
}
