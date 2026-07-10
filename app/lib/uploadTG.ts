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

    const mediaObj = message.media;
    
    // Витягуємо документи з повідомлення або з прев'ю посилань (WebPage)
    const document = mediaObj.document;
    const webpageDocument = mediaObj.webpage?.document;

    // 1. Блокуємо прямі відео, "кругляшки" та анімації (GIF) через їхній mimeType
    if (document?.mimeType?.startsWith("video/") || document?.mimeType === "image/gif") {
      return null;
    }

    // 2. Блокуємо відео, які прилетіли через прев'ю зовнішніх посилань
    if (webpageDocument?.mimeType?.startsWith("video/")) {
      return null;
    }

    // 3. Якщо це документ (файл, скинутий без стиснення), дозволяємо завантаження ТІЛЬКИ якщо це картинка
    if (document && !document.mimeType?.startsWith("image/")) {
      return null;
    }

    // Фолбек-перевірка на випадок, якщо об'єкт зберіг класи GramJS, але mimeType чомусь порожній
    if (mediaObj.className === "MessageMediaDocument" && document && !document.mimeType?.startsWith("image/")) {
      return null;
    }

    // Якщо пройшли всі фільтри — завантажуємо чисте фото
    const media = await client.downloadMedia(mediaObj, {});

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