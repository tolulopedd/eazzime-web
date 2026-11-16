import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { services } from "@/lib/content";
import { PageHero, Button } from "@/components/ui";
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
                "We agree on scope, work in manageable stages, and review progress with your team."}
            </p>
            <Button href={`/contact/?service=${s.slug}`}>
              Discuss Your Project
            </Button>
          </div>
          <article className="benefits-panel">
            <span className="icon-box">
              <Icon name={s.icon} size={32} />
            </span>
            <h3>Business benefits</h3>
            {s.benefits.map((b) => (
              <p key={b}>
                <Check size={19} />
                {b}
              </p>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
