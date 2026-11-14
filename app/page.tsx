import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Braces,
  Database,
  Landmark,
  Atom,
  Code2,
} from "lucide-react";
import Link from "next/link";
import {
  Button,
  SectionTitle,
  ServiceCards,
  ContactCTA,
  ProductVisual,
  SolutionCards,
  TextLink,
} from "@/components/ui";
import { Reveal } from "@/components/motion";
import { Icon } from "@/components/icons";
import { industries, steps, site } from "@/lib/content";
export const metadata = { alternates: { canonical: "/" } };
export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-grid container">
          <div className="hero-copy">
            <h1>
              Big ideas.
              <br />
              Fintech solutions.
              <br />
              <em>Real impact.</em>
            </h1>
            <p>{site.tagline}</p>
            <div className="hero-actions">
              <Button href="/services/">Explore Our Services</Button>
              <Link className="hero-talk" href="/contact/">
                Let’s Talk <ArrowUpRight size={19} />
              </Link>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={15} /> Business-first thinking
              </span>
              <span>
                <Check size={15} /> Built for the long term
              </span>
            </div>
          </div>
          <ProductVisual />
        </div>
        <div className="container hero-bottom">
          <span>FROM YOUR FIRST IDEA TO YOUR NEXT BIG MOVE.</span>
          <a href="#introduction" aria-label="Discover EazziMe">
            <ArrowDown size={17} />
          </a>
          <span>IDEA · PRODUCT DESIGN · ENGINEERING · SOLUTION</span>
        </div>
      </section>
      <div className="expertise-strip">
        <div className="container">
          <span>
            IDEAS INTO
            <br />
            <b>EVERYDAY SOLUTION</b>
          </span>
          <p>
            <Code2 />
            Custom software
          </p>
          <p>
            <Atom />
            AI Automation
          </p>
          <p>
            <Landmark />
            Banking Solution
          </p>
          <p>
            <Database />
            Data Warehouse &amp; Analytics
          </p>
        </div>
      </div>
      <section className="section" id="introduction">
        <div className="container about-intro">
          <Reveal>
            <SectionTitle
              eyebrow="HELLO, WE’RE EAZZIME"
              title="Your business is unique. Your technology should be too."
            />
          </Reveal>
          <Reveal className="intro-copy">
            <p>
              Great technology starts with understanding your business. We bring
              strategy, design, and engineering together to solve the challenges
              that stand between you and what’s next.
            </p>
            <p>
              From a new digital product to a more connected enterprise, we help
              turn ambition into practical, lasting solutions.
            </p>
            <TextLink href="/about/">Get to know EazziMe</TextLink>
          </Reveal>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="WHAT WE DO"
              title="The expertise to move you forward."
              description="From the first conversation to continuous improvement, we bring the right capabilities to every stage."
            />
            <TextLink href="/services/">View all services</TextLink>
          </div>
          <ServiceCards limit={6} />
          <div className="service-footnote">
            <Braces size={22} />
            <p>One partner. A connected approach to technology.</p>
            <Link href="/services/">
              Discover all 10 services <ArrowRightInline />
            </Link>
          </div>
        </div>
      </section>
      <section className="section industries-section">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="BUILT AROUND YOUR WORLD"
              title="Different industries. Shared ambition."
              description="Technology shaped by the way your industry works, and where you want to take it."
            />
            <TextLink href="/industries/">Explore industries</TextLink>
          </div>
          <div className="industry-strip">
            {industries.map(([title, , icon]) => (
              <Link
                href={`/industries/#${title.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                key={title}
              >
                <Icon name={icon} size={29} />
                <h3>{title}</h3>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section why-section">
        <div className="container why-grid">
          <div>
            <SectionTitle
              light
              eyebrow="THE EAZZIME APPROACH"
              title="More than a technology provider. A partner in your progress."
            />
            <p>
              We connect technical decisions to business priorities, so every
              step has a purpose.
            </p>
            <Button href="/about/#approach" secondary>
              How We Work
            </Button>
            <div className="brand-orbit" aria-hidden="true">
              <img src="/icon.svg" alt="" width="110" height="120" />
            </div>
          </div>
          <div className="why-list">
            {[
              [
                "Business first. Always.",
                "We start with what you need to achieve, then choose the technology that gets you there.",
              ],
              [
                "Built with you, not just for you.",
                "Clear communication, regular feedback, and shared decisions keep your team involved.",
              ],
              [
                "Quality in the details.",
                "Security, accessibility, and maintainability are part of how we design and build.",
              ],
              [
                "A long-term perspective.",
                "We create a foundation you can keep improving as your needs evolve.",
              ],
            ].map(([title, copy], i) => (
              <Reveal key={title}>
                <article>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="PROJECTS WE’VE BUILT"
              title="A look at what we build."
              description="Explore RentSure, ChaufX, EazziHotech, and EazziBulkBuy—platforms we’ve developed for real estate, personal-driver services, hospitality, and commerce."
            />
            <TextLink href="/solutions/">Explore solutions</TextLink>
          </div>
          <SolutionCards />
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <SectionTitle
            eyebrow="FROM COMPLEXITY TO CLARITY"
            title="A clear process. A shared direction."
          />
          <div className="process-grid">
            {steps.map(([title, copy], i) => (
              <Reveal key={title}>
                <span className="process-number">
                  0{i + 1}
                  <span />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="tech-section">
        <div className="container">
          <div className="eyebrow">
            <span />
            THE RIGHT TOOLS FOR YOUR CHALLENGE
          </div>
          <h2>Modern technology. Purposefully chosen.</h2>
          <div className="tech-list">
            {[
              "React",
              "Next.js",
              "TypeScript",
              "Python",
              "Node.js",
              "Azure",
              "AWS",
              "PostgreSQL",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <p>
            We select each stack around your requirements, your team, and the
            life of your product.
          </p>
        </div>
      </section>
      <ContactCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: site.name,
            url: site.url,
            logo: `${site.url}/brand/logo-light.png`,
            description: site.tagline,
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
function ArrowRightInline() {
  return <ArrowUpRight size={17} />;
}
