import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { syncNews } from "@/app/lib/syncNews";

export async function GET() {
  try {
    // Фонова авто-синхронізація (якщо вона у вас там налаштована)
    syncNews().catch((err) => console.error("Помилка авто-синхронізації:", err));

    // Обмежуємо вибірку з БД до 4 найсвіжіших новин
    const news = await prisma.news.findMany({
      orderBy: { publishedAt: "desc" },
      take: 6, // <--- ЗМІНЮЄМО ТУТ НА 4
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Помилка API новин:", error);
    return NextResponse.json([], { status: 500 });
  }
}