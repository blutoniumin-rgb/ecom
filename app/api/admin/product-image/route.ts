import { randomUUID } from "node:crypto";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureStoredImages } from "@/lib/stored-image";

const MAX_BYTES = 5 * 1024 * 1024;

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

function imageType(bytes: Uint8Array): { extension: "jpg" | "png" | "webp" | "gif"; mime: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mime: "image/jpeg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", mime: "image/png" };
  }
  if (
    bytes.length >= 6 &&
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return { extension: "gif", mime: "image/gif" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { extension: "webp", mime: "image/webp" };
  }
  return null;
}

export async function POST(request: Request) {
  await connection();

  const session = await getSession();
  if (!session || session.role !== "admin") {
    return json({ error: "Sign in as an admin to upload images." }, 401);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Choose an image file." }, 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: "Choose an image file." }, 400);
  }
  if (file.size > MAX_BYTES) {
    return json({ error: "Each image must be 5 MB or smaller." }, 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    return json({ error: "Each image must be 5 MB or smaller." }, 400);
  }

  const type = imageType(bytes);
  if (!type) {
    return json({ error: "Upload a JPEG, PNG, WebP, or GIF image." }, 400);
  }

  const id = randomUUID();
  await ensureStoredImages();
  await prisma.storedImage.create({
    data: {
      id,
      mime: type.mime,
      data: Buffer.from(bytes),
    },
  });

  return json({ path: `/api/media/${id}` });
}
