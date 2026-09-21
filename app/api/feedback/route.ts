import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

const ALLOWED_CATEGORIES = new Set([
  "review",
  "error",
  "resource",
  "delete",
]);

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

// ============================================================
// GET — отримання всіх feedback
// ============================================================

export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(feedbacks, {
      status: 200,
    });
  } catch (error) {
    console.error("FEEDBACK GET ERROR:", error);

    return NextResponse.json(
      {
        error: "Не вдалося завантажити звернення",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST — створення нового feedback
// ============================================================

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const email = formData.get("email");
    const category = formData.get("category");
    const message = formData.get("message");

    // -----------------------------
    // Перевірка основних полів
    // -----------------------------

    if (
      typeof email !== "string" ||
      typeof category !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Некоректні дані форми",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail = email.trim();
    const normalizedMessage = message.trim();
    const normalizedCategory = category.trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        {
          error: "Вкажіть електронну пошту",
        },
        {
          status: 400,
        }
      );
    }

    if (!normalizedMessage) {
      return NextResponse.json(
        {
          error: "Вкажіть текст повідомлення",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Перевірка email
    // -----------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          error: "Некоректна електронна пошта",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Перевірка категорії
    // -----------------------------

    if (!ALLOWED_CATEGORIES.has(normalizedCategory)) {
      return NextResponse.json(
        {
          error: "Некоректна категорія звернення",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Отримання фотографій
    // -----------------------------

    const imageEntries = formData.getAll("images");

    const files = imageEntries.filter(
      (entry): entry is File => entry instanceof File
    );

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        {
          error: `Можна завантажити максимум ${MAX_FILES} фотографій`,
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------
    // Папка для feedback фото
    // -----------------------------

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "feedback"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const imagePaths: string[] = [];

    // -----------------------------
    // Збереження фотографій
    // -----------------------------

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            error: `Файл "${file.name}" має непідтримуваний формат`,
          },
          {
            status: 400,
          }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `Файл "${file.name}" перевищує максимальний розмір 10 MB`,
          },
          {
            status: 400,
          }
        );
      }

      const extension = getExtension(file.name, file.type);

      const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

      const filepath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(filepath, buffer);

      imagePaths.push(`/uploads/feedback/${filename}`);
    }

    // -----------------------------
    // Створення запису в БД
    // -----------------------------

    const feedback = await prisma.feedback.create({
      data: {
        email: normalizedEmail,
        category: normalizedCategory,
        message: normalizedMessage,
        images: imagePaths,
      },
    });

    return NextResponse.json(
      {
        success: true,
        feedback,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("FEEDBACK POST ERROR:", error);

    return NextResponse.json(
      {
        error: "Не вдалося створити звернення",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// Визначення розширення файлу
// ============================================================

function getExtension(
  filename: string,
  mimeType: string
): string {
  const extension = path.extname(filename).toLowerCase();

  if (extension) {
    return extension;
  }

  switch (mimeType) {
    case "image/jpeg":
      return ".jpg";

    case "image/png":
      return ".png";

    case "image/webp":
      return ".webp";

    default:
      return "";
  }
}

