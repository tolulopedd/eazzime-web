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
        title="Good technology begins with understanding."
        description="We bring business context and technical craft together to help you build what comes next."
      />
      <section className="section">
        <div className="container about-intro">
          <SectionTitle
            eyebrow="OUR PURPOSE"
            title="Make technology work for your business."
          />
          <div className="intro-copy">
            <p>
              EazziMe Technologies Inc. is a technology and digital
              transformation company focused on building software, connecting
              systems, and making business processes work better.
            </p>
            <p>
              Our approach brings consulting, product design, engineering,
              implementation and support into one conversation. We help you make
              clear decisions, build useful solutions, and keep improving them
              over time to meet the need of your customers.
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
            title="Principles you can see in the work."
          />
          <div className="four-col">
            {[
              [
                "Clarity",
                "Make decisions understandable. Share the reasoning, the trade-offs, and the next step.",
              ],
              [
                "Ownership",
                "Stay accountable for the work and the care it needs beyond delivery.",
              ],
              [
                "Collaboration",
                "Respect the knowledge within your team and build with it.",
              ],
              [
                "Purposeful innovation",
                "Explore new ideas where they solve a real problem.",
              ],
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
