
import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import prisma from "@/app/lib/prisma";
import { getSessionAdmin } from "@/app/lib/admin-auth";

const INVITE_DURATION = 4 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    // Перевіряємо авторизацію адміністратора
    const currentAdmin = await getSessionAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Необхідно авторизуватися" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Вкажіть email користувача" },
        { status: 400 }
      );
    }

    // Перевіряємо формат email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Вкажіть коректний email" },
        { status: 400 }
      );
    }

    // Перевіряємо, чи існує адміністратор із таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Користувач із таким email уже існує" },
        { status: 409 }
      );
    }

    // Видаляємо невикористані запрошення для цього email
    await prisma.adminInvite.deleteMany({
      where: {
        email,
        usedAt: null,
      },
    });

    // Генеруємо випадковий токен
    const token = randomBytes(32).toString("hex");

    // У базі зберігаємо лише SHA-256 хеш токена
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(Date.now() + INVITE_DURATION);

    await prisma.adminInvite.create({
      data: {
        email,
        tokenHash,
        expiresAt,
      },
    });

    // Формуємо посилання для реєстрації
    const baseUrl =
      process.env.BETTER_AUTH_URL || request.nextUrl.origin;

    const inviteUrl = new URL(
      "/admin/accept-invite",
      baseUrl
    );

    inviteUrl.searchParams.set("token", token);

    return NextResponse.json({
      success: true,
      message: "Запрошення успішно створено",
      email,
      inviteUrl: inviteUrl.toString(),
      expiresAt,
    });
  } catch (error) {
    console.error("Create invite error:", error);

    return NextResponse.json(
      { error: "Не вдалося створити запрошення" },
      { status: 500 }
    );
  }
}
