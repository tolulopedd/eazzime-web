import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { services, steps } from "@/lib/content";
import { PageHero, Button, ContactCTA, SectionTitle } from "@/components/ui";
import { Icon } from "@/components/icons";
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  return {
    title: s?.title,
    description: s?.description,
    alternates: { canonical: `/services/${slug}/` },
  };
}
export default async function Service({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = services.find((s) => s.slug === slug);
  if (!s) notFound();
  return (
    <>
      <PageHero
        eyebrow="OUR EXPERTISE"
        title={s.title}
        description={s.description}
      />
      <section className="section">
        <div className="container detail-grid">
          <div>
            <Link className="text-link" href="/services/">
              <ArrowLeft size={16} />
              All services
            </Link>
            <h2>{s.short}</h2>
            <p>
              {s.details ??
                "We begin with your business context, existing systems, and the people who will use the solution. Together, we define a practical scope, make the trade-offs clear, and deliver in manageable stages."}
            </p>
            <Button href={`/contact/?service=${s.slug}`}>
              Discuss Your Project
            </Button>
          </div>
          <article className="benefits-panel">
            <span className="icon-box">
              <Icon name={s.icon} size={32} />
            </span>
            <h3>What this means for your business</h3>
            {s.benefits.map((b) => (
              <p key={b}>
                <Check size={19} />
                {b}
              </p>
            ))}
          </article>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <SectionTitle
            eyebrow="FROM DISCOVERY TO DELIVERY"
            title="A practical path to progress."
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
