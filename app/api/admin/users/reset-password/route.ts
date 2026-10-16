
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import prisma from "@/app/lib/prisma";
import { getSessionAdmin } from "@/app/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо, що запит виконує авторизований адміністратор.
    const auth = await getSessionAdmin();

    if (!auth) {
      return NextResponse.json(
        { error: "Потрібно увійти в систему" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => null);

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Не вказано email користувача" },
        { status: 400 },
      );
    }

    // Знаходимо обліковий запис.
    const targetAdmin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
      },
    });

    if (!targetAdmin) {
      return NextResponse.json(
        { error: "Користувача не знайдено" },
        { status: 404 },
      );
    }

    if (!targetAdmin.active) {
      return NextResponse.json(
        { error: "Цей обліковий запис неактивний" },
        { status: 400 },
      );
    }

    // Генеруємо криптографічно випадковий токен.
    const token = crypto.randomBytes(32).toString("hex");

    // У БД зберігаємо лише SHA-256 хеш токена.
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Посилання дійсне протягом 1 години.
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Попередній токен цього користувача анулюється.
    await prisma.$transaction(async (tx) => {
      await tx.adminPasswordResetToken.deleteMany({
        where: {
          adminId: targetAdmin.id,
        },
      });

      await tx.adminPasswordResetToken.create({
        data: {
          adminId: targetAdmin.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    // Сторінка має бути доступна за цим маршрутом.
    const resetUrl = new URL(
      `/reset-password/${encodeURIComponent(token)}`,
      request.nextUrl.origin,
    ).toString();

    return NextResponse.json({
      success: true,
      message: "Посилання для скидання пароля створено",
      resetUrl,
      expiresAt: expiresAt.toISOString(),
      user: {
        name: targetAdmin.name,
        email: targetAdmin.email,
      },
    });
  } catch (error) {
    console.error(
      "Помилка створення посилання для скидання пароля:",
      error,
    );

    return NextResponse.json(
      { error: "Внутрішня помилка сервера" },
      { status: 500 },
    );
  }
}
