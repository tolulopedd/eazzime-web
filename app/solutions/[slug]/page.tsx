import { notFound } from "next/navigation";
import { solutions } from "@/lib/content";
import {
  PageHero,
  ProductVisual,
  ProjectVisual,
  Button,
  ContactCTA,
} from "@/components/ui";
import { ArrowUpRight, Check } from "lucide-react";
export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = solutions.find((s) => s.slug === slug);
  return {
    title: s?.title,
    description: s?.description,
    alternates: { canonical: `/solutions/${slug}/` },
  };
}
export default async function Solution({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = solutions.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <>
      <PageHero
        eyebrow={`${s.category.toUpperCase()} · ${s.projectUrl ? "BUILT BY EAZZIME" : "SOLUTION CONCEPT"}`}
        title={s.title}
        description={s.description}
      />
      <section className="section">
        <div className="container detail-grid">
          <div className="solution-detail-visual">
            {s.projectUrl ? (
              <ProjectVisual type={s.type} />
            ) : (
              <ProductVisual compact type={s.type} />
            )}
          </div>
          <div>
            {s.projectUrl ? (
              <>
                <span className="eyebrow">PROJECT SPOTLIGHT</span>
                <h2>{s.projectHeadline}</h2>
                <p>{s.projectDetails}</p>
                <h3>The customer experience</h3>
                <ul className="project-features">
                  {s.features.map((feature) => (
                    <li key={feature}>
                      <Check size={17} aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  className="button"
                  href={s.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit {s.title} <ArrowUpRight size={18} aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </>
            ) : (
              <>
                <span className="eyebrow">AN ILLUSTRATIVE STARTING POINT</span>
                <h2>Designed around the work that matters.</h2>
                <p>
                  This concept explores how a focused digital experience can
                  bring people, information, and processes together. It is not a
                  live product or a claim of delivered client work.
                </p>
                <h3>How we would shape it with you</h3>
                <p>
                  Map your workflows, validate the experience with your team,
                  connect the right data sources, and agree on the measures that
                  define a useful outcome.
                </p>
              </>
            )}
            <div className="tags">
              {s.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <Button href="/contact/">Discuss a Similar Solution</Button>
          </div>
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
