import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureStoredImages } from "@/lib/stored-image";

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await context.params;
  if (!ID_PATTERN.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  await ensureStoredImages();
  const image = await prisma.storedImage.findUnique({ where: { id } });
  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = image.data instanceof Uint8Array ? image.data : new Uint8Array(image.data);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
