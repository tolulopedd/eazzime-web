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
        title="Ideas brought to life."
        description="Explore platforms we’ve built to connect people, simplify operations, and bring business ideas to life."
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
