import { industries } from "@/lib/content";
import { PageHero, TextLink, ContactCTA } from "@/components/ui";
import { Icon } from "@/components/icons";
export const metadata = {
  alternates: { canonical: "/industries/" },
  title: "Industries",
  description:
    "Technology solutions for financial services, fintech, retail, logistics, real estate, hospitality, and professional services.",
};
export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="INDUSTRIES WE SERVE"
        title="Built for your industry."
        description="Solutions shaped around your customers, workflows, and systems."
      />
      <section className="section">
        <div className="container industry-grid">
          {industries.map(([title, copy, icon], i) => (
            <article
              id={title.toLowerCase().replace(/[^a-z]+/g, "-")}
              key={title}
            >
              <span className="icon-box">
                <Icon name={icon} size={30} />
              </span>
              <span className="card-number">0{i + 1}</span>
              <h2>{title}</h2>
              <p>{copy}</p>
              <TextLink
                href={`/contact/?industry=${encodeURIComponent(title)}`}
              >
                Discuss your needs
              </TextLink>
            </article>
          ))}
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
