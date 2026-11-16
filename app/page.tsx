import {
  ArrowDown,
  ArrowUpRight,
  Check,
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
import { industries, site } from "@/lib/content";
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
              <Button href="/contact/">Discuss Your Project</Button>
              <Link className="hero-talk" href="/services/">
                Explore Services <ArrowUpRight size={19} />
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
              title="Technology built around your business."
            />
          </Reveal>
          <Reveal className="intro-copy">
            <p>
              We design software, connect systems, and turn business data into
              useful insights—all shaped around how your team works.
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
              title="What we can help you build."
            />
            <TextLink href="/services/">View all services</TextLink>
          </div>
          <ServiceCards limit={6} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="PROJECTS WE’VE BUILT"
              title="Projects we’ve built."
            />
            <TextLink href="/solutions/">View all projects</TextLink>
          </div>
          <SolutionCards />
        </div>
      </section>
      <section className="section industries-section">
        <div className="container">
          <div className="section-heading-row">
            <SectionTitle
              eyebrow="BUILT AROUND YOUR WORLD"
              title="Expertise across industries."
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
              title="A partner from idea to launch."
            />
            <p>Clear priorities. Shared decisions. Support beyond launch.</p>
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
                "Business focus",
                "Technology choices guided by your business goals.",
              ],
              [
                "Close collaboration",
                "Regular reviews keep your team involved.",
              ],
              [
                "Careful engineering",
                "Security, accessibility, and maintainability built into the work.",
              ],
              [
                "Ongoing support",
                "Maintain and improve your product as needs change.",
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
      <section className="tech-section">
        <div className="container">
          <div className="eyebrow">
            <span />
            OUR TECHNOLOGY STACK
          </div>
          <h2>The right tools for your product.</h2>
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
