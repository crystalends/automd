import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = readdirSync(projectRoot).filter((file) => extname(file) === ".html").sort();
const failures = [];
const bemClassPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/u;
const pageScopes = new Set([
  "about-page", "article-detail-page", "articles-page", "branch-page", "brand-page", "business-page",
  "cars-page", "careers-page", "client-zone-page", "contacts-page", "diagnostics-page", "error-page",
  "legal-page", "model-page", "model-service-detail-page", "parts-page", "prices-page", "promotion-detail-page",
  "promotions-page", "reviews-page", "service-detail-page", "services-page", "tour-page", "warranty-page",
]);
const allowedCrossBlockSelectors = new Set([
  "site-header--vehicles-open|vehicle-menu",
  "site-header--vehicles-open|site-nav__link",
  "mobile-menu__logo|brand-logo__mark",
  "mobile-menu__logo|brand-logo__caption",
]);
const getBemBlock = (className) => className.split(/__|--/u, 1)[0];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const file of htmlFiles) {
  const markup = readFileSync(resolve(projectRoot, file), "utf8");
  const localStyles = [...markup.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"|<link\b[^>]*href="([^"]+)"[^>]*rel="stylesheet"/g)]
    .map((match) => match[1] || match[2]);
  const localScripts = [...markup.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gu)]
    .map((match) => match[1])
    .filter((source) => !/^(?:https?:|data:)/u.test(source));

  check(localStyles.length === 1 && localStyles[0] === "app.css", `${file}: expected app.css to be the only stylesheet`);
  check(localScripts.length === 1 && localScripts[0] === "app.js", `${file}: expected app.js to be the only script`);
  check((markup.match(/<main\b/gu) ?? []).length === 1, `${file}: expected exactly one main element`);
  check((markup.match(/<h1\b/gu) ?? []).length === 1, `${file}: expected exactly one h1 element`);
  check(/<html\b[^>]*lang="ru"/u.test(markup), `${file}: missing lang=ru`);

  const ids = [...markup.matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
  const idSet = new Set(ids);
  check(ids.length === idSet.size, `${file}: duplicate id attribute`);

  for (const match of markup.matchAll(/\bhref="#([^"]*)"/gu)) {
    check(Boolean(match[1]) && idSet.has(match[1]), `${file}: unresolved hash link #${match[1]}`);
  }

  for (const match of markup.matchAll(/<img\b[^>]*>/gu)) {
    const image = match[0];
    check(/\balt="[^"]*"/u.test(image), `${file}: image without alt`);
    check(/\bwidth="\d+"/u.test(image) && /\bheight="\d+"/u.test(image), `${file}: image without intrinsic dimensions`);

    const source = image.match(/\bsrc="([^"]+)"/u)?.[1];
    if (source && !/^(?:https?:|data:)/u.test(source)) {
      check(existsSync(resolve(projectRoot, source)), `${file}: missing image ${source}`);
    }
  }

  for (const match of markup.matchAll(/<(?:input|select|textarea)\b[^>]*>/gu)) {
    check(/\bname="[^"]+"/u.test(match[0]), `${file}: form control without a name`);
  }

  for (const match of markup.matchAll(/<select\b[^>]*>([\s\S]*?)<\/select>/gu)) {
    const select = match[0];
    const options = match[1];
    check(/\brequired\b/u.test(select), `${file}: select is missing required validation`);
    check(/<option\b[^>]*\bvalue=""[^>]*\bdisabled\b[^>]*>/u.test(options), `${file}: select is missing a disabled empty option`);
  }

  for (const match of markup.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gu)) {
    const source = match[1];
    if (!/^(?:https?:|data:)/u.test(source)) {
      check(existsSync(resolve(projectRoot, source)), `${file}: missing script ${source}`);
    }
  }

  for (const match of markup.matchAll(/class="([^"]*)"/gu)) {
    const classes = match[1].trim().split(/\s+/u).filter(Boolean);
    for (const className of classes) {
      check(bemClassPattern.test(className), `${file}: invalid BEM class ${className}`);
      check(!className.includes("__") || className.indexOf("__") === className.lastIndexOf("__"), `${file}: nested BEM element ${className}`);
      const classWithoutBemSeparator = className.replaceAll("__", "");
      check(!/[A-Z_]/u.test(classWithoutBemSeparator), `${file}: invalid class casing ${className}`);
      if (!className.includes("--")) continue;
      const baseClass = className.split("--", 1)[0];
      check(classes.includes(baseClass), `${file}: modifier ${className} is missing base ${baseClass}`);
    }
  }
}

const cssFiles = readdirSync(projectRoot).filter((file) => extname(file) === ".css");
const firstPartyCss = cssFiles
  .filter((file) => file !== "app.css")
  .map((file) => readFileSync(resolve(projectRoot, file), "utf8"))
  .join("\n");
check(!firstPartyCss.includes("!important"), "first-party CSS contains !important");

for (const match of firstPartyCss.matchAll(/\.([a-zA-Z_][a-zA-Z0-9_-]*)/gu)) {
  check(bemClassPattern.test(match[1]), `CSS: invalid BEM class ${match[1]}`);
}

const structuralTagPattern = /\.([a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)(?:(?:\[[^\]]+\]|:[a-z-]+(?:\([^)]*\))?))*\s+(a|b|button|h[1-6]|img|input|li|p|small|span|strong|summary|svg|ul)\b/gu;
for (const match of firstPartyCss.matchAll(structuralTagPattern)) {
  const richTextSelector = ["article-content", "legal-content"].includes(match[1])
    && ["h2", "h3", "p"].includes(match[2]);
  check(richTextSelector, `CSS: structural tag selector .${match[1]} ${match[2]} must use a BEM element class`);
}

const classPairPattern = /(?=(\.([a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)\s+\.([a-z0-9-]+(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?)(?![a-z0-9_-])))/gu;
for (const match of firstPartyCss.matchAll(classPairPattern)) {
  const parent = match[2];
  const child = match[3];
  const sameBlock = getBemBlock(parent) === getBemBlock(child);
  const pageScope = pageScopes.has(parent) || pageScopes.has(getBemBlock(parent));
  const thirdParty = getBemBlock(child).startsWith("swiper");
  const explicitException = allowedCrossBlockSelectors.has(`${parent}|${child}`);
  check(sameBlock || pageScope || thirdParty || explicitException, `CSS: cross-block selector .${parent} .${child} must use a BEM mix`);
}

for (const file of cssFiles) {
  const css = readFileSync(resolve(projectRoot, file), "utf8");
  check(!/@import\b/u.test(css), `${file}: CSS @import blocks rendering`);
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gu)) {
    const source = match[1].trim();
    if (/^(?:https?:|data:|#)/u.test(source)) continue;
    check(existsSync(resolve(projectRoot, source)), `${file}: missing CSS asset ${source}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Audit passed for ${htmlFiles.length} HTML pages.`);
}
