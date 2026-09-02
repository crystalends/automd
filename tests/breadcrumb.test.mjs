import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sharedStyles = readFileSync(resolve(projectRoot, "breadcrumb.css"), "utf8");
const buildScript = readFileSync(resolve(projectRoot, "scripts/build-css.mjs"), "utf8");
const pages = readdirSync(projectRoot).filter((file) => file.endsWith(".html"));

const getBreadcrumbs = (markup) =>
  [...markup.matchAll(/<nav\b[^>]*aria-label="Хлебные крошки"[^>]*>[\s\S]*?<\/nav>/g)].map(
    ([breadcrumb]) => breadcrumb,
  );

test("every project breadcrumb uses the shared BEM block", () => {
  let breadcrumbCount = 0;

  for (const page of pages) {
    const markup = readFileSync(resolve(projectRoot, page), "utf8");
    for (const breadcrumb of getBreadcrumbs(markup)) {
      breadcrumbCount += 1;
      assert.match(breadcrumb, /class="[^"]*\bbreadcrumb\b[^"]*"/, `${page}: missing breadcrumb block`);
      assert.doesNotMatch(breadcrumb, />›</, `${page}: uses the old breadcrumb separator`);
    }
  }

  assert.equal(breadcrumbCount, 25);
});

test("shared breadcrumb visuals match the desktop Figma node 228:21715", () => {
  assert.match(
    sharedStyles,
    /\.breadcrumb\s*\{[^}]*position:\s*relative[^}]*z-index:\s*2[^}]*display:\s*flex[^}]*min-height:\s*17px[^}]*align-items:\s*center[^}]*gap:\s*6px[^}]*color:\s*var\(--muted\)[^}]*font-size:\s*14px[^}]*font-weight:\s*400[^}]*line-height:\s*1\.2[^}]*white-space:\s*nowrap/s,
  );
  assert.match(
    sharedStyles,
    /\.breadcrumb > \[aria-current="page"\]\s*\{[^}]*color:\s*var\(--blue\)/s,
  );
  assert.match(sharedStyles, /\.breadcrumb > \[aria-hidden="true"\]\s*\{[^}]*color:\s*var\(--muted\)/s);
  assert.match(sharedStyles, /\.breadcrumb > a:hover\s*\{[^}]*color:\s*var\(--red\)/s);
});

test("every mobile breadcrumb stays visible and matches Figma node 346:32913", () => {
  assert.match(
    sharedStyles,
    /@media \(max-width:\s*767px\)\s*\{[\s\S]*?\.breadcrumb\s*\{[^}]*min-height:\s*12px[^}]*overflow-x:\s*auto[^}]*font-size:\s*12px[^}]*line-height:\s*1/s,
  );

  const firstPartyStyles = readdirSync(projectRoot)
    .filter((file) => file.endsWith(".css") && !["app.css", "breadcrumb.css"].includes(file))
    .map((file) => readFileSync(resolve(projectRoot, file), "utf8"))
    .join("\n");

  assert.doesNotMatch(
    firstPartyStyles,
    /\.[a-z0-9-]*breadcrumb[^,{]*\{[^}]*display:\s*none/s,
    "page styles must not hide the shared breadcrumb",
  );
});

test("shared breadcrumb styles are emitted after page-specific styles", () => {
  const breadcrumbIndex = buildScript.indexOf('{ file: "breadcrumb.css" }');
  const lastPageStyleIndex = buildScript.indexOf('{ file: "diagnostics-page.css"');

  assert.ok(breadcrumbIndex > lastPageStyleIndex);
});
