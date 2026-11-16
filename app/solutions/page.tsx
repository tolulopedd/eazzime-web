import { PageHero, SolutionCards, ContactCTA } from "@/components/ui";
export const metadata = {
  alternates: { canonical: "/solutions/" },
  title: "Our Solutions",
  description:
    "Explore RentSure, ChaufX, EazziHotech, and EazziBulkBuy—projects developed by EazziMe for real estate, driver services, hospitality, and commerce.",
};
export default function Solutions() {
  return (
    <>
      <PageHero
        eyebrow="OUR SOLUTIONS"
        title="Our work in action."
        description="Explore the products we’ve built for real estate, driver services, hospitality, and commerce."
      />
      <section className="section">
        <div className="container">
          <h2 className="sr-only">Explore our projects</h2>
          <SolutionCards />
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
