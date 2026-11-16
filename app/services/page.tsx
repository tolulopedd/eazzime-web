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
        title="Expertise for your next project."
        description="Software, AI, design, and data services—from planning to ongoing support."
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
