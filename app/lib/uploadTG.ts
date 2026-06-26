import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function uploadTG(
  client: any,
  message: any
): Promise<string | null> {
  try {
    if (!message?.media) {
      return null;
    }

    // Пропускаємо відео
    if (message.media.className === "MessageMediaDocument") {
      return null;
    }

    const media = await client.downloadMedia(message.media, {});

    if (!media) {
      return null;
    }

    const buffer = Buffer.isBuffer(media)
      ? media
      : Buffer.from(media as string);

    const uploadDir = path.join(process.cwd(), "public/uploads");

    await mkdir(uploadDir, {
      recursive: true,
    });

    const filename = `${crypto.randomUUID()}.jpg`;

    await writeFile(
      path.join(uploadDir, filename),
      buffer
    );

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("uploadTG:", err);
    return null;
  }
}