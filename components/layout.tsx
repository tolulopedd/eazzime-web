"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { site } from "@/lib/content";
const links = [
  ["Home", "/"],
  ["About Us", "/about/"],
  ["Our Services", "/services/"],
  ["Industries", "/industries/"],
  ["Our Solutions", "/solutions/"],
];
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.getElementById("menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" aria-label="EazziMe Technologies home">
          <img
            className="logo"
            src="/brand/logo-light.png"
            alt="EazziMe Technologies Inc."
            width="185"
            height="59"
          />
        </Link>
        <nav aria-label="Main navigation" className="desktop-nav">
          {links.map(([label, url]) => (
            <Link
              key={url}
              href={url}
              aria-current={pathname === url ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link className="button small header-cta" href="/contact/">
          Let’s Talk <ArrowUpRight size={16} />
        </Link>
        <button
          id="menu-toggle"
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-nav"
          aria-label="Mobile navigation"
        >
          {[...links, ["Let’s Talk", "/contact/"]].map(([label, url]) => (
            <Link key={url} href={url} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Link href="/">
            <img
              src="/brand/logo-dark.png"
              alt="EazziMe Technologies Inc."
              width="205"
              height="66"
            />
          </Link>
          <p>
            Thoughtful technology.
            <br />
            Meaningful business impact.
          </p>
          <span className="footer-note">
            Your next chapter starts with a conversation.
          </span>
        </div>
        <div>
          <h3>Explore</h3>
          {links.slice(1).map(([label, url]) => (
            <Link key={url} href={url}>
              {label}
            </Link>
          ))}
        </div>
        <div>
          <h3>What we do</h3>
          <Link href="/services/custom-software/">Software development</Link>
          <Link href="/services/ai-automation/">AI & automation</Link>
          <Link href="/services/data-engineering/">Data Engineering</Link>
          <Link href="/services/digital-transformation/">
            Digital transformation
          </Link>
        </div>
        <div>
          <h3>Let’s connect</h3>
          <Link href="/contact/">
            Start a conversation <ArrowUpRight size={14} />
          </Link>
          {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
          {site.phone && (
            <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>
              {site.phone}
            </a>
          )}
          {site.linkedin && (
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <ArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} EazziMe Technologies Inc. All rights
          reserved.
        </span>
        <Link href="/privacy/">Privacy Policy</Link>
        <span>Built for what’s next.</span>
      </div>
    </footer>
  );
}
