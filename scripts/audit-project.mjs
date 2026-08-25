import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = readdirSync(projectRoot).filter((file) => extname(file) === ".html").sort();
const failures = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const file of htmlFiles) {
  const markup = readFileSync(resolve(projectRoot, file), "utf8");
  const localStyles = [...markup.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"|<link\b[^>]*href="([^"]+)"[^>]*rel="stylesheet"/g)]
    .map((match) => match[1] || match[2]);

  check(localStyles.length === 1 && localStyles[0] === "app.css", `${file}: expected app.css to be the only stylesheet`);
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

  const hasSwiperMarkup = /class="[^"]*\bswiper\b/u.test(markup);
  const hasSwiperScript = /src="vendor\/swiper\/swiper-bundle\.min\.js"/u.test(markup);
  check(hasSwiperMarkup === hasSwiperScript, `${file}: Swiper script does not match page usage`);

  for (const match of markup.matchAll(/class="([^"]*)"/gu)) {
    const classes = match[1].trim().split(/\s+/u).filter(Boolean);
    for (const className of classes) {
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
