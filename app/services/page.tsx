import { PageHero, ServiceCards, ContactCTA } from "@/components/ui";
export const metadata = {
  alternates: { canonical: "/services/" },
  title: "Our Services",
  description:
    "Explore EazziMe’s software development, AI, data engineering, design, integration, consulting, support, and analytics services.",
};
export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="OUR SERVICES"
        title="Your goals. Our expertise. A better way forward."
        description="A connected set of capabilities to build new products, modernize operations, and turn technology into a business advantage."
      />
      <section className="section soft">
        <div className="container">
          <h2 className="sr-only">Our technology services</h2>
          <ServiceCards />
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
