import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
const root = "out";
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
test("all exported page links and image assets resolve", () => {
  assert.ok(existsSync(root), "Run npm run build first");
  for (const file of files(root).filter((f) => f.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    for (const match of html.matchAll(
      /(?:href|src)="(\/(?!\/)[^"?]*)(?:\?[^" ]*)?"/g,
    )) {
      const path = match[1].split("#")[0];
      const target = join(root, decodeURIComponent(path));
      assert.ok(
        existsSync(target) || existsSync(join(target, "index.html")),
        `${file}: unresolved ${path}`,
      );
    }
  }
});
test("all public pages have one primary heading, metadata and language", () => {
  for (const file of files(root).filter(
    (f) => f.endsWith("index.html") && !f.includes("_not-found"),
  )) {
    const html = readFileSync(file, "utf8");
    assert.equal((html.match(/<h1(?: |>)/g) || []).length, 1, file);
    assert.match(html, /<html lang="en"/, file);
    assert.match(html, /<meta name="description" content="[^"]+"/, file);
    assert.match(html, /<title>[^<]+<\/title>/, file);
    for (const img of html.matchAll(/<img\b[^>]*>/g))
      assert.match(img[0], /alt="[^"]*"/, file);
  }
});
