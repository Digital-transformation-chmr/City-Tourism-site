import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    console.log("🔄 Авто-ініціалізація Prisma Client за стандартами Prisma 7...");

    // Чистий конструктор. Рядок підключення Prisma автоматично 
    // витягне з вашого prisma.config.ts під час виконання запиту
    const client = new PrismaClient();

    // 🔌 Тестовий запит для перевірки з'єднання
    client.$queryRaw`SELECT 1`
      .then(() => {
        console.log("✅ Успішно: База даних PostgreSQL підключена!");
      })
      .catch((error: any) => {
        console.error("❌ Помилка підключення до БД!");
        console.error("👉 Деталі помилки:", error.message);
      });

    globalForPrisma.prisma = client;
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();