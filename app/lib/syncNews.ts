import prisma from "@/app/lib/prisma";
import { fetchTelegramNews } from "./fetchTelegramNews";
import { uploadTG } from "./uploadTG";

export async function syncNews() {
  console.log("=== Sync Telegram ===");

  const { posts, client } = await fetchTelegramNews();

  const newsModel = (prisma as any).news;

  let created = 0;
  let updated = 0;

  for (const post of posts) {
    if (!post.content) continue;

    const existing = await newsModel.findUnique({
      where: {
        telegramId: post.telegramId,
      },
    });

    let image = existing?.image ?? null;

    // Якщо пост новий або ще немає локальної картинки
    if (
      post.rawMessage?.media &&
      (!existing ||
        !existing.image ||
        existing.image.startsWith("http"))
    ) {
      console.log(`Downloading media ${post.telegramId}`);

      const uploaded = await uploadTG(
        client,
        post.rawMessage
      );

      if (uploaded) {
        image = uploaded;
      }
    }

    await newsModel.upsert({
      where: {
        telegramId: post.telegramId,
      },
      update: {
        content: post.content,
        image,
        publishedAt: new Date(post.date),
      },
      create: {
        telegramId: post.telegramId,
        content: post.content,
        image,
        publishedAt: new Date(post.date),
      },
    });

    if (existing) {
      updated++;
    } else {
      created++;
    }
  }

  console.log(
    `Sync complete. Created: ${created}. Updated: ${updated}.`
  );

  return {
    created,
    updated,
  };
}