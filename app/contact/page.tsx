import { PageHero } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/content";
import { ArrowUpRight, Check, MapPin, Phone, Mail } from "lucide-react";
export const metadata = {
  alternates: { canonical: "/contact/" },
  title: "Contact Us",
  description:
    "Tell EazziMe about your project, business challenge, or digital transformation plans.",
};
export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="LET’S TALK"
        title="Every great solution starts with a conversation."
        description="Tell us about your goals, where you are today, and what you want to do next."
      />
      <section className="section soft">
        <div className="container contact-grid">
          <aside>
            <span className="eyebrow">YOUR NEXT STEP</span>
            <h2>Let’s find the right way forward.</h2>
            <p>
              You don’t need a finished brief. Bring your questions, your ideas,
              or the challenge you’re working through.
            </p>
            <h3>What happens next?</h3>
            {[
              "We review your message and business context.",
              "We connect to understand your priorities.",
              "Together, we define a practical next step.",
            ].map((t) => (
              <p className="check-line" key={t}>
                <Check size={18} />
                {t}
              </p>
            ))}
            <div className="contact-details">
              <strong>{site.name}</strong>
              <address className="contact-address">
                <MapPin size={18} aria-hidden="true" />
                <span>{site.address}</span>
              </address>
              <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
                <Phone size={18} aria-hidden="true" />
                {site.phone}
              </a>
              {site.email && (
                <a href={`mailto:${site.email}`}>
                  <Mail size={18} aria-hidden="true" />
                  <span>{site.email}</span>
                </a>
              )}
              {site.linkedin && (
                <a
                  href={site.linkedin}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Connect on LinkedIn
                  <ArrowUpRight size={16} />
                </a>
              )}
            </div>
          </aside>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
