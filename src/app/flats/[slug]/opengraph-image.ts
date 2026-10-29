import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getFlat } from "@/services/flats";
// WhatsApp não exibe bem og:image em WebP nem acima de ~300 KB: servimos a capa
// do imóvel como JPEG 1200x630.
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
export const alt = "Foto do imóvel — Cespedes Living";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const flat = await getFlat((await params).slug);
  const src = flat?.coverImage ?? "/images/hero.webp";
  const input = src.startsWith("/")
    ? await readFile(path.join(process.cwd(), "public", src))
    : Buffer.from(await (await fetch(src)).arrayBuffer());
  const jpeg = await sharp(input)
    .resize(size.width, size.height, { fit: "cover" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
