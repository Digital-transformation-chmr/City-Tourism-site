import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = typeof body.token === "string" ? body.token : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: "Некоректне посилання для скидання пароля" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль повинен містити щонайменше 8 символів" },
        { status: 400 },
      );
    }

    // bcrypt враховує не більше 72 байтів пароля.
    if (Buffer.byteLength(password, "utf8") > 72) {
      return NextResponse.json(
        { error: "Пароль не повинен перевищувати 72 байти" },
        { status: 400 },
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await prisma.adminPasswordResetToken.findUnique({
      where: { tokenHash },
      include: { admin: true },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt <= new Date() ||
      !resetToken.admin.active
    ) {
      return NextResponse.json(
        { error: "Посилання недійсне або строк його дії минув" },
        { status: 400 },
      );
    }

    const keyHash = await bcrypt.hash(password, 12);
    const now = new Date();

    // Перевіряємо та позначаємо токен використаним у межах транзакції.
    const success = await prisma.$transaction(async (tx) => {
      const claimed = await tx.adminPasswordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (claimed.count !== 1) {
        return false;
      }

      await tx.admin.update({
        where: { id: resetToken.adminId },
        data: { keyHash },
      });

      await tx.adminSession.deleteMany({
        where: { adminId: resetToken.adminId },
      });

      await tx.adminPasswordResetToken.deleteMany({
        where: {
          adminId: resetToken.adminId,
          id: { not: resetToken.id },
        },
      });

      return true;
    });

    if (!success) {
      return NextResponse.json(
        { error: "Це посилання вже використано або воно прострочене" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Пароль успішно змінено. Увійдіть із новим паролем.",
    });

    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("Помилка скидання пароля:", error);

    return NextResponse.json(
      { error: "Не вдалося змінити пароль" },
      { status: 500 },
    );
  }
}