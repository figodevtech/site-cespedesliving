// Diagnostic previews only: the site always consumes the separate generated photographs.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const { groups } = JSON.parse(await fs.readFile('public/images/image-manifest.json', 'utf8'));
await fs.mkdir('tmp/qa', { recursive: true });
for (const [key, records] of Object.entries(groups)) {
  const tiles = [];
  for (let i = 0; i < records.length; i++) {
    const source = 'public' + records[i].src;
    tiles.push({ input: await sharp(source).resize(500, 330).toBuffer(), left: (i % 2) * 500, top: Math.floor(i / 2) * 360 });
    tiles.push({ input: Buffer.from(`<svg width="500" height="30"><rect width="500" height="30" fill="#0f2d3d"/><text x="12" y="21" fill="#fff" font-size="15">${records[i].key}</text></svg>`), left: (i % 2) * 500, top: Math.floor(i / 2) * 360 + 330 });
  }
  await sharp({ create: { width:1000, height:Math.ceil(records.length / 2) * 360, channels:3, background:'#f6f6f1' } }).composite(tiles).png().toFile(`tmp/qa/${key}.png`);
}
console.log('Diagnostic contact sheets written to tmp/qa.');
