import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Layers3,
  Activity,
  ShieldCheck,
  Workflow,
  Rocket,
  Hotel,
  KeyRound,
  CalendarCheck,
  House,
  FileCheck2,
} from "lucide-react";
import { Reveal } from "./motion";
import { Icon } from "./icons";
import { services, solutions } from "@/lib/content";
export function Button({
  children,
  href,
  secondary = false,
}: {
  children: React.ReactNode;
  href: string;
  secondary?: boolean;
}) {
  return (
    <Link className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <ArrowUpRight size={18} />
    </Link>
  );
}
export function SectionTitle({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-title ${light ? "light" : ""}`}>
      <div className="eyebrow">
        <span />
        {eyebrow}
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-hero-orbit" aria-hidden="true" />
    </section>
  );
}
export function ContactCTA() {
  return (
    <section className="cta-section">
      <div className="container cta-inner">
        <div>
          <div className="eyebrow">
            <span />
            LET’S TALK
          </div>
          <h2>What would you like to build?</h2>
          <p>Share your idea. Let’s work out the next step.</p>
        </div>
        <Button href="/contact/">Discuss Your Project</Button>
      </div>
    </section>
  );
}
export function ServiceCards({ limit }: { limit?: number }) {
  return (
    <div className="service-grid">
      {services.slice(0, limit).map((service, i) => (
        <Reveal key={service.slug}>
          <Link className="service-card" href={`/services/${service.slug}/`}>
            <div className="card-top">
              <span className="icon-box">
                <Icon name={service.icon} />
              </span>
              <span className="card-number">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <h3>{service.title}</h3>
            <p>{service.short}</p>
            <span className="text-link">
              Explore service <ArrowUpRight size={17} />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
export function ProductVisual({
  compact = false,
  type = "dashboard",
}: {
  compact?: boolean;
  type?: string;
}) {
  return (
    <div
      className={`product-scene ${compact ? "compact" : ""} ${type}`}
      role="img"
      aria-label="Illustrative business application interface"
    >
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      <div className="product-window">
        <div className="window-top">
          <span className="mini-brand">
            <Layers3 size={17} /> eazzime <b>workspace</b>
          </span>
          <span className="window-dots">•••</span>
        </div>
        <div className="window-body">
          <aside className="mock-sidebar">
            <div className="mock-avatar">e.</div>
            <span className="selected">
              <Activity size={16} />
            </span>
            <Layers3 size={16} />
            <Workflow size={16} />
            <ShieldCheck size={16} />
          </aside>
          <div className="mock-content">
            <div className="mock-heading">
              <div>
                <small>YOUR BUSINESS, CONNECTED</small>
                <h3>
                  {type === "ai"
                    ? "Knowledge workspace"
                    : type === "commerce"
                      ? "Commerce overview"
                      : "Operations overview"}
                </h3>
              </div>
              <span className="live-dot">Live</span>
            </div>
            <div className="mock-stats">
              <div>
                <span>Workflows</span>
                <strong>
                  Connected <Check size={13} />
                </strong>
              </div>
              <div>
                <span>Infrastructure</span>
                <strong>
                  Healthy <span className="tiny-dot" />
                </strong>
              </div>
              <div>
                <span>Insights</span>
                <strong>In real time</strong>
              </div>
            </div>
            <div className="chart-panel">
              <div>
                <b>
                  {type === "ai"
                    ? "Knowledge activity"
                    : type === "commerce"
                      ? "Order activity"
                      : "Business activity"}
                </b>
                <span>Overview ↗</span>
              </div>
              <div className="chart">
                <div className="chart-grid" />
                <svg
                  viewBox="0 0 460 130"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id={`chart-${compact}-${type}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#16b7a7" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#16b7a7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 110 C30 110 35 78 70 88 S110 120 145 73 S180 90 215 60 S250 80 285 40 S320 65 355 28 S400 50 460 6 L460 130 L0 130Z"
                    fill={`url(#chart-${compact}-${type})`}
                  />
                  <path
                    d="M0 110 C30 110 35 78 70 88 S110 120 145 73 S180 90 215 60 S250 80 285 40 S320 65 355 28 S400 50 460 6"
                    stroke="#16b7a7"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </div>
              <div className="chart-labels">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
              </div>
            </div>
            <div className="mock-bottom">
              <span>
                <ShieldCheck size={15} /> Systems connected
              </span>
              <span>
                <span className="tiny-dot" /> All services operational
              </span>
            </div>
          </div>
        </div>
      </div>
      {!compact && (
        <>
          <div className="floating-card automation">
            <span className="float-icon">
              <Workflow size={21} />
            </span>
            <div>
              <small>WORK SMARTER</small>
              <b>Intelligent automation</b>
              <span>Less friction. More possibility.</span>
            </div>
            <span className="check-circle">
              <Check size={14} />
            </span>
          </div>
          <div className="floating-card ai-float">
            <Rocket size={18} />
            <span>From idea to impact</span>
            <ArrowUpRight size={16} />
          </div>
          <span className="visual-caption">
            CONNECTED THINKING. REAL-WORLD SOLUTIONS.
          </span>
        </>
      )}
    </div>
  );
}
export function BulkBuyVisual() {
  return (
    <div className="bulkbuy-visual">
      <img
        className="bulkbuy-produce"
        src="/projects/eazzibulkbuy/produce.webp"
        alt="Fresh tomatoes in bulk produce boxes"
        width={900}
        height={600}
        loading="lazy"
      />
      <div className="bulkbuy-brand">
        <img
          src="/projects/eazzibulkbuy/logo.png"
          alt="EazziBulkBuy"
          width={210}
          height={105}
          loading="lazy"
        />
        <span>FOOD & PRODUCE · BULK ORDERING</span>
      </div>
    </div>
  );
}
export function ProjectVisual({ type }: { type: string }) {
  if (type === "rentsure")
    return (
      <div className="rentsure-visual">
        <div className="rentsure-wordmark">
          <House size={28} aria-hidden="true" />
          <strong>RentSure</strong>
        </div>
        <span className="rentsure-kicker">RENTAL PROFILES & RENT SCORES</span>
        <div className="rentsure-illustration" aria-hidden="true">
          <House size={84} strokeWidth={1} />
          <span>
            <FileCheck2 size={26} />
          </span>
        </div>
        <div className="rentsure-audience">
          <span>Tenants</span>
          <span>Landlords</span>
          <span>Agents</span>
        </div>
      </div>
    );
  if (type === "hotech")
    return (
      <div className="hotech-visual">
        <div className="hotech-brand">
          <img
            src="/projects/eazzihotech/logo.png"
            alt=""
            width={44}
            height={44}
            loading="lazy"
          />
          <strong>EazziHotech</strong>
        </div>
        <span className="hotech-caption">HOSPITALITY OPERATIONS</span>
        <div className="hotech-symbol" aria-hidden="true">
          <Hotel size={74} strokeWidth={1} />
        </div>
        <div className="hotech-capabilities">
          <span>
            <CalendarCheck size={16} aria-hidden="true" />
            Bookings
          </span>
          <span>
            <KeyRound size={16} aria-hidden="true" />
            Guest stays
          </span>
        </div>
      </div>
    );
  if (type !== "chaufx") return <BulkBuyVisual />;
  return (
    <div className="chaufx-visual">
      <img
        className="chaufx-photo"
        src="/projects/chaufx/driver.webp"
        alt="Chauffeur beside a car outside a hotel"
        width={736}
        height={736}
        loading="lazy"
      />
      <div className="chaufx-brand">
        <img
          src="/projects/chaufx/logo.png"
          alt="ChaufX"
          width={210}
          height={37}
          loading="lazy"
        />
        <span>CUSTOMER & DRIVER PLATFORM</span>
      </div>
    </div>
  );
}
export function SolutionCards() {
  return (
    <div
      className={`solution-grid ${solutions.length > 3 ? "solution-grid-even" : ""}`}
    >
      {solutions.map((s) => (
        <Reveal key={s.slug}>
          <Link className="solution-card" href={`/solutions/${s.slug}/`}>
            <div className="solution-image">
              {s.projectUrl ? (
                <ProjectVisual type={s.type} />
              ) : (
                <ProductVisual compact type={s.type} />
              )}
              <span className="concept-badge">
                {s.projectUrl ? "Built by EazziMe" : "Solution concept"}
              </span>
            </div>
            <div className="solution-copy">
              <small>{s.category}</small>
              <h3>
                {s.title}
                <ArrowUpRight size={21} />
              </h3>
              <p>{s.description}</p>
              <div className="tags">
                {s.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
