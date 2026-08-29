import { readdir, readFile, stat, unlink } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = resolve(projectRoot, "assets");
const shouldDelete = process.argv.includes("--delete");
const sourceExtensions = new Set([".css", ".html", ".js"]);
const ignoredSources = new Set(["app.css", "app.js"]);
const alwaysKeep = new Set([
  "assets/fonts/LICENSE-Geologica.txt",
  "assets/fonts/LICENSE-Onest.txt",
  "assets/fonts/aa-stetica-regular.ttf",
]);
const generatedAssetReferences = new Set([
  "assets/mobile-menu-pin.svg",
  "assets/mobile-menu-time.svg",
  "assets/mobile-menu-phone.svg",
  "assets/mobile-menu-arrow-blue.svg",
  "assets/mobile-menu-arrow-red.svg",
  "assets/mobile-menu-arrow-small.svg",
]);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
};

const rootFiles = await readdir(projectRoot, { withFileTypes: true });
const sourceFiles = rootFiles
  .filter((entry) => entry.isFile() && sourceExtensions.has(extname(entry.name)) && !ignoredSources.has(entry.name))
  .map((entry) => resolve(projectRoot, entry.name));
sourceFiles.push(...(await walk(resolve(projectRoot, "js"))).filter((file) => extname(file) === ".js"));

const references = new Set([...alwaysKeep, ...generatedAssetReferences]);
for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/assets\/[A-Za-z0-9._/-]+/gu)) references.add(match[0]);
}

const assetFiles = await walk(assetsRoot);
const unused = assetFiles
  .map((file) => relative(projectRoot, file))
  .filter((file) => !references.has(file))
  .sort();
const unusedBytes = (await Promise.all(unused.map((file) => stat(resolve(projectRoot, file)))))
  .reduce((total, details) => total + details.size, 0);

if (shouldDelete) {
  await Promise.all(unused.map((file) => unlink(resolve(projectRoot, file))));
  console.log(`Deleted ${unused.length} unused assets (${(unusedBytes / 1024 / 1024).toFixed(1)} MiB).`);
} else if (unused.length) {
  console.error(`Unused assets (${unused.length}, ${(unusedBytes / 1024 / 1024).toFixed(1)} MiB):\n${unused.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Asset audit passed for ${assetFiles.length} files.`);
}
