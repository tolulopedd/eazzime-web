import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
const source = ts.transpileModule(readFileSync("lib/content.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext },
}).outputText;
const { services, solutions } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
writeFileSync(
  "netlify/lib/knowledge.json",
  JSON.stringify(
    {
      company: "EazziMe Technologies Inc.",
      email: "info@eazzime.com",
      services: services.map(
        ({ slug, title, description, details, benefits }) => ({
          slug,
          title,
          description,
          details,
          benefits,
          source: `/services/${slug}/`,
        }),
      ),
      projects: solutions.map(
        ({
          title,
          description,
          projectDetails,
          features,
          projectUrl,
          slug,
        }) => ({
          title,
          description,
          projectDetails,
          features,
          projectUrl,
          source: `/solutions/${slug}/`,
        }),
      ),
      guidance: [
        "MVP enquiries are handled through product design and custom software development. Scope must be confirmed by the team.",
        "Fintech enquiries are welcome; regulatory compliance, specific banking integrations and certifications must be confirmed by the team.",
        "ChaufX is a personal-driver platform. Do not describe it as a banking or money-transfer product.",
        "No published price list, guaranteed timelines, client testimonials or performance statistics are available.",
        "A free 30-minute technology consultation is offered; availability is determined by the booking calendar.",
      ],
    },
    null,
    2,
  ) + "\n",
);
