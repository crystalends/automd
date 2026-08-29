import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = "app.css";
const pageClasses = [
  "about-page",
  "article-detail-page",
  "articles-page",
  "branch-page",
  "brand-page",
  "cars-page",
  "careers-page",
  "client-zone-page",
  "contacts-page",
  "error-page",
  "legal-page",
  "model-service-detail-page",
  "parts-page",
  "prices-page",
  "promotion-detail-page",
  "promotions-page",
  "reviews-page",
  "service-detail-page",
  "services-page",
  "tour-page",
  "warranty-page",
];

// The sequence mirrors the former per-page link order. Branch used about before brand,
// so its brand rules are emitted as one small, separately scoped compatibility layer.
const sourceGroups = [
  { file: "vendor/swiper/swiper-bundle.min.css" },
  { file: "fonts.css" },
  { file: "styles.css" },
  { file: "brand-page.css", scopes: ["brand-page", "services-page"] },
  {
    file: "about-page.css",
    scopes: [
      "about-page",
      "article-detail-page",
      "articles-page",
      "branch-page",
      "careers-page",
      "contacts-page",
      "parts-page",
      "prices-page",
      "reviews-page",
      "service-detail-page",
      "services-page",
      "tour-page",
      "warranty-page",
    ],
  },
  { file: "brand-page.css", scopes: ["branch-page"] },
  { file: "services-page.css", scopes: ["service-detail-page", "services-page"] },
  { file: "cars-page.css", scopes: ["cars-page"] },
  { file: "careers-page.css", scopes: ["careers-page"] },
  { file: "promotions-page.css", scopes: ["promotions-page"] },
  { file: "articles-page.css", scopes: ["article-detail-page", "articles-page", "legal-page"] },
  { file: "legal-page.css", scopes: ["legal-page"] },
  { file: "3d-tour-page.css", scopes: ["tour-page"] },
  { file: "article-detail.css", scopes: ["article-detail-page"] },
  { file: "branch-page.css", scopes: ["branch-page"] },
  { file: "client-zone-page.css", scopes: ["client-zone-page"] },
  { file: "contacts-page.css", scopes: ["contacts-page"] },
  { file: "error-page.css", scopes: ["error-page"] },
  { file: "promotion-detail.css", scopes: ["promotion-detail-page"] },
  { file: "reviews-page.css", scopes: ["reviews-page"] },
  { file: "service-detail.css", scopes: ["service-detail-page"] },
  { file: "model-service-detail.css", scopes: ["model-service-detail-page"] },
  { file: "parts-page.css", scopes: ["parts-page"] },
  { file: "prices-page.css", scopes: ["prices-page"] },
  { file: "warranty-page.css", scopes: ["warranty-page"] },
];

const hasPageScope = (selector) =>
  pageClasses.some((className) => new RegExp(`\\.${className}(?![a-z0-9-])`, "u").test(selector));

const splitSelectors = (prelude) => {
  const selectors = [];
  let start = 0;
  let depth = 0;
  let quote = "";

  for (let index = 0; index < prelude.length; index += 1) {
    const character = prelude[index];
    if (quote) {
      if (character === quote && prelude[index - 1] !== "\\") quote = "";
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === "(" || character === "[") depth += 1;
    else if (character === ")" || character === "]") depth -= 1;
    else if (character === "," && depth === 0) {
      selectors.push(prelude.slice(start, index));
      start = index + 1;
    }
  }
  selectors.push(prelude.slice(start));
  return selectors;
};

const scopeSelector = (selector, scopes) => {
  const leadingSpace = selector.match(/^\s*/u)?.[0] ?? "";
  const trailingSpace = selector.match(/\s*$/u)?.[0] ?? "";
  const value = selector.trim();
  if (!value || hasPageScope(value)) return selector;

  const scope = `:where(${scopes.map((className) => `body.${className}`).join(", ")})`;
  if (value === "body") return `${leadingSpace}${scope}${trailingSpace}`;
  if (value.startsWith("body")) return `${leadingSpace}${value.replace(/^body/u, scope)}${trailingSpace}`;
  return `${leadingSpace}${scope} ${value}${trailingSpace}`;
};

const scopeCss = (css, scopes) => {
  let output = "";
  let segmentStart = 0;
  let quote = "";
  let inComment = false;
  const contexts = [];

  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    const next = css[index + 1];

    if (inComment) {
      if (character === "*" && next === "/") {
        inComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (character === quote && css[index - 1] !== "\\") quote = "";
      continue;
    }
    if (character === "/" && next === "*") {
      inComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character !== "{" && character !== "}") continue;

    const segment = css.slice(segmentStart, index);
    if (character === "{") {
      const prelude = segment.trimStart();
      const parent = contexts.at(-1);
      const isAtRule = prelude.startsWith("@");
      const isKeyframeStep = parent === "keyframes";
      const context = /^@(?:-webkit-)?keyframes\b/u.test(prelude)
        ? "keyframes"
        : isAtRule
          ? "at-rule"
          : "style";

      if (!isAtRule && !isKeyframeStep && parent !== "style") {
        const indentation = segment.slice(0, segment.length - prelude.length);
        const scoped = splitSelectors(prelude).map((selector) => scopeSelector(selector, scopes)).join(",");
        output += `${indentation}${scoped}{`;
      } else {
        output += `${segment}{`;
      }
      contexts.push(isKeyframeStep ? "keyframe-step" : context);
    } else {
      output += `${segment}}`;
      contexts.pop();
    }
    segmentStart = index + 1;
  }

  return output + css.slice(segmentStart);
};

const sections = await Promise.all(
  sourceGroups.map(async ({ file, scopes }) => {
    const source = await readFile(resolve(projectRoot, file), "utf8");
    const css = scopes ? scopeCss(source, scopes) : source;
    const scopeLabel = scopes ? `; scope: ${scopes.join(", ")}` : "";
    return `/* source: ${file}${scopeLabel} */\n${css.trim()}\n`;
  }),
);

const banner = [
  "/* AutoMD CSS bundle.",
  " * Generated by `npm run build`; edit the source files listed in scripts/build-css.mjs.",
  " */",
  "",
].join("\n");

await writeFile(resolve(projectRoot, outputFile), `${banner}${sections.join("\n")}`, "utf8");
console.log(`Built ${outputFile} from ${sourceGroups.length} scoped source groups.`);
