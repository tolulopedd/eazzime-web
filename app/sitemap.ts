import type { MetadataRoute } from "next";
import { site, services, solutions } from "@/lib/content";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "about/",
    "services/",
    "industries/",
    "solutions/",
    "contact/",
    "privacy/",
    ...services.map((s) => `services/${s.slug}/`),
    ...solutions.map((s) => `solutions/${s.slug}/`),
  ].map((path) => ({
    url: `${site.url.replace(/\/$/, "")}/${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
