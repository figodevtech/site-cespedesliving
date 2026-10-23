import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const outputDir = "public/logos/optimized";
await fs.mkdir(outputDir, { recursive: true });
const monogram = "public/logos/Monograma CL Dourado Luxuoso.png";
// Crop only the outer padding of the supplied square. Preserve its artwork and navy background.
const iconSource = await sharp(monogram)
  .extract({ left: 166, top: 166, width: 920, height: 920 })
  .png()
  .toBuffer();
const entries = [];
for (const size of [16, 32, 48, 180, 192, 512]) {
  const png = await sharp(iconSource)
    .resize(size, size, { kernel: "lanczos3" })
    .png()
    .toBuffer();
  const name = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await fs.writeFile(path.join(outputDir, name), png);
  if (size <= 48) entries.push({ size, png });
}
// Standard ICO directory containing the three original PNG resolutions.
const header = Buffer.alloc(6 + 16 * entries.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = header.length;
for (const [i, { size, png }] of entries.entries()) {
  const start = 6 + 16 * i;
  header[start] = size;
  header[start + 1] = size;
  header.writeUInt16LE(1, start + 4);
  header.writeUInt16LE(32, start + 6);
  header.writeUInt32LE(png.length, start + 8);
  header.writeUInt32LE(offset, start + 12);
  offset += png.length;
}
await fs.writeFile(
  "public/favicon.ico",
  Buffer.concat([header, ...entries.map((e) => e.png)]),
);

const assets = {};
for (const key of ["logo-horizontal", "logo-stacked"]) {
  const record = JSON.parse(
    await fs.readFile(`docs/brand-assets/${key}.json`, "utf8"),
  );
  const metadata = await sharp(record.path).metadata();
  if (!metadata.hasAlpha)
    throw new Error(`${key} must have a transparent background`);
  const output = path.join(outputDir, `${key}.webp`);
  const result = await sharp(record.path)
    .trim({ threshold: 12 })
    .resize({
      width: key === "logo-horizontal" ? 960 : 768,
      withoutEnlargement: true,
    })
    .webp({ lossless: true, effort: 6 })
    .toFile(output);
  assets[key] = {
    src: `/logos/optimized/${key}.webp`,
    width: result.width,
    height: result.height,
    bytes: result.size,
  };
}
await fs.writeFile(
  "src/data/brand.json",
  JSON.stringify(assets, null, 2) + "\n",
);
console.log(JSON.stringify({ assets, icons: entries.map((e) => e.size) }));
