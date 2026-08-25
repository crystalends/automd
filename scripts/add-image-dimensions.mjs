import { readFile, writeFile } from "node:fs/promises";
import { readdirSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const pngSize = (buffer) => ({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });

const jpegSize = (buffer) => {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
};

const svgSize = (source) => {
  const svg = source.match(/<svg\b[^>]*>/u)?.[0] ?? "";
  const width = Number.parseFloat(svg.match(/\bwidth="([\d.]+)(?:px)?"/u)?.[1]);
  const height = Number.parseFloat(svg.match(/\bheight="([\d.]+)(?:px)?"/u)?.[1]);
  if (width > 0 && height > 0) return { width: Math.round(width), height: Math.round(height) };
  const viewBox = svg.match(/\bviewBox="[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/u);
  return viewBox ? { width: Math.round(Number(viewBox[1])), height: Math.round(Number(viewBox[2])) } : null;
};

const getImageSize = async (source) => {
  const path = resolve(projectRoot, source);
  const extension = extname(path).toLowerCase();
  if (extension === ".svg") return svgSize(await readFile(path, "utf8"));
  const buffer = await readFile(path);
  // Inspect the signature because some legacy assets have a misleading extension.
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return pngSize(buffer);
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return jpegSize(buffer);
  return null;
};

for (const file of readdirSync(projectRoot).filter((entry) => extname(entry) === ".html")) {
  const path = resolve(projectRoot, file);
  let markup = await readFile(path, "utf8");
  const images = [...markup.matchAll(/<img\b[^>]*>/gu)];
  const replacements = await Promise.all(images.map(async ({ 0: image }) => {
    if (/\bwidth="\d+"/u.test(image) && /\bheight="\d+"/u.test(image)) return image;
    const source = image.match(/\bsrc="([^"]+)"/u)?.[1];
    if (!source || /^(?:https?:|data:)/u.test(source)) return image;
    const size = await getImageSize(source);
    if (!size) throw new Error(`${file}: cannot determine dimensions for ${source}`);
    return image.replace(/\s*\/>$/u, ` width="${size.width}" height="${size.height}" />`);
  }));

  let index = 0;
  markup = markup.replace(/<img\b[^>]*>/gu, () => replacements[index++]);
  await writeFile(path, markup, "utf8");
}

console.log("Added intrinsic dimensions to local images.");
