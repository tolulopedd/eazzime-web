import { PageHero, SectionTitle, ContactCTA } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { steps } from "@/lib/content";
export const metadata = {
  alternates: { canonical: "/about/" },
  title: "About Us",
  description:
    "Meet EazziMe: a technology and digital transformation partner focused on practical, lasting business solutions.",
};
export default function About() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT EAZZIME"
        title="Your technology partner."
        description="Consulting, design, engineering, and support in one team."
      />
      <section className="section">
        <div className="container about-intro">
          <SectionTitle
            eyebrow="OUR PURPOSE"
            title="Built around your priorities."
          />
          <div className="intro-copy">
            <p>
              EazziMe Technologies Inc. builds software, connects systems, and
              helps businesses make better use of their data.
            </p>
            <p>
              From consulting and product design to implementation and support,
              we work with your team to meet your customers’ needs.
            </p>
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container two-col">
          <article className="statement">
            <span className="eyebrow">OUR MISSION</span>
            <h2>Make complex challenges easier to solve.</h2>
            <p>
              Empower businesses with thoughtful technology that helps people
              work better and opens new possibilities.
            </p>
          </article>
          <article className="statement navy">
            <span className="eyebrow">OUR VISION</span>
            <h2>A future where technology enables every ambition.</h2>
            <p>
              Help businesses move forward with confidence through accessible,
              adaptable digital solutions.
            </p>
          </article>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionTitle
            eyebrow="WHAT GUIDES US"
            title="How we work together."
          />
          <div className="four-col">
            {[
              ["Clarity", "Clear decisions, trade-offs, and next steps."],
              ["Ownership", "Accountability through delivery and support."],
              ["Collaboration", "Your team’s knowledge informs the work."],
              ["Purposeful innovation", "New ideas that solve real problems."],
            ].map(([t, d]) => (
              <Reveal key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft" id="approach">
        <div className="container">
          <SectionTitle
            eyebrow="HOW WE WORK"
            title="A partnership, from day one."
          />
          <div className="process-grid">
            {steps.map(([t, d], i) => (
              <article key={t}>
                <span className="process-number">0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
