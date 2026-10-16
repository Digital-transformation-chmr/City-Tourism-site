import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcrypt";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";
    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const password =
      typeof body.password === "string" ? body.password : "";

    // Перевірка даних
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: "Некоректне посилання запрошення" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Ім'я має містити від 2 до 100 символів" },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: "Пароль має містити від 8 до 128 символів" },
        { status: 400 }
      );
    }

    // Знаходимо запрошення за хешем токена
    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const invite = await tx.adminInvite.findUnique({
        where: { tokenHash },
      });

      if (!invite) {
        throw new Error("INVITE_NOT_FOUND");
      }

      if (invite.usedAt) {
        throw new Error("INVITE_ALREADY_USED");
      }

      if (invite.expiresAt.getTime() <= Date.now()) {
        throw new Error("INVITE_EXPIRED");
      }

      // Захищаємося від повторного використання запрошення
      const claimed = await tx.adminInvite.updateMany({
        where: {
          id: invite.id,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (claimed.count !== 1) {
        throw new Error("INVITE_ALREADY_USED");
      }

      const existingAdmin = await tx.admin.findUnique({
        where: { email: invite.email },
        select: { id: true },
      });

      if (existingAdmin) {
        throw new Error("EMAIL_EXISTS");
      }

      await tx.admin.create({
        data: {
          name,
          email: invite.email,
          keyHash: passwordHash,
          role: "admin",
          active: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Обліковий запис успішно створено",
    });
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVITE_NOT_FOUND":
          return NextResponse.json(
            { error: "Запрошення не знайдено" },
            { status: 404 }
          );

        case "INVITE_ALREADY_USED":
          return NextResponse.json(
            { error: "Це запрошення вже використано" },
            { status: 410 }
          );

        case "INVITE_EXPIRED":
          return NextResponse.json(
            { error: "Термін дії запрошення закінчився" },
            { status: 410 }
          );

        case "EMAIL_EXISTS":
          return NextResponse.json(
            { error: "Користувач із таким email уже існує" },
            { status: 409 }
          );
      }
    }

    console.error("Accept invite error:", error);

    return NextResponse.json(
      { error: "Не вдалося створити обліковий запис" },
      { status: 500 }
    );
  }
}
