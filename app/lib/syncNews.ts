import prisma from "@/app/lib/prisma";
import { fetchTelegramNews } from "./fetchTelegramNews"; // Переконайтеся, що вона повертає об'єкти повідомлень з gramJS, або змініть логіку нижче
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Функція для збереження бінарного буфера, отриманого прямо з gramJS
async function saveTelegramBuffer(buffer: Buffer, originalExt: string = "jpg"): Promise<string | null> {
  try {
    const filename = `${crypto.randomUUID()}.${originalExt}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Створюємо папку, якщо її немає
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Помилка збереження медіа-буфера на диск:", error);
    return null;
  }
}

export async function syncNews() {
  console.log("=== Старт фонової синхронізації новин ===");

  // Припустимо, fetchTelegramNews ініціалізує клієнта gramJS і повертає масив постів.
  // Щоб скачувати медіа, нам потрібен сам екземпляр клієнта (client) та оригінальні об'єкти повідомлень (message)
  const { posts, client } = await fetchTelegramNews(); 
  let added = 0;

  const newsModel = (prisma as any).news;

  for (const post of posts) {
    if (!post.content) continue;

    const existingPost = await newsModel.findUnique({
      where: { telegramId: post.telegramId },
    });

    let localImagePath = existingPost?.image || null;

    // Якщо пост новий АБО у старого поста ще немає локальної картинки
    if (post.rawMessage?.media && (!existingPost || !existingPost.image || existingPost.image.startsWith("http"))) {
      console.log(`Завантажуємо оригінальне медіа через gramJS для поста ${post.telegramId}...`);
      
      try {
        // Завантажуємо медіафайл напряму через активну сесію gramJS
        const mediaResult = await client.downloadMedia(post.rawMessage.media, {});
        
        if (mediaResult) {
          // ЗАХИСТ ВІД ТИПІЗАЦІЇ: Конвертуємо результат у Buffer, якщо це рядок, або беремо як є
          const buffer = Buffer.isBuffer(mediaResult) 
            ? mediaResult 
            : Buffer.from(mediaResult as string);

          const savedPath = await saveTelegramBuffer(buffer, "jpg");
          if (savedPath) {
            localImagePath = savedPath;
          }
        }
      } catch (mediaError) {
        console.error(`Не вдалося завантажити медіа для поста ${post.telegramId} через gramJS:`, mediaError);
      }
    }

    await newsModel.upsert({
      where: { telegramId: post.telegramId },
      update: {
        content: post.content,
        image: localImagePath,
        publishedAt: new Date(post.date),
      },
      create: {
        telegramId: post.telegramId,
        content: post.content,
        image: localImagePath,
        publishedAt: new Date(post.date),
      },
    });

    added++;
  }

  console.log(`=== Синхронізацію завершено. Оброблено постів: ${added} ===`);
  return { added };
}