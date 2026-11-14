import { Button } from "@/components/ui";
export default function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="eyebrow">404 · PAGE NOT FOUND</div>
        <h1>Let’s get you back on track.</h1>
        <p>The page you’re looking for may have moved.</p>
        <Button href="/">Back to Home</Button>
      </div>
    </section>
  );
}
