import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Токен запрошення не вказано" },
        { status: 400 }
      );
    }

    // Хешуємо токен із URL.
    // У базі зберігається тільки цей хеш.
    const tokenHash = crypto
      .createHash("sha256")
      .update(id)
      .digest("hex");

    const invite = await prisma.adminInvite.findUnique({
      where: {
        tokenHash,
      },
      select: {
        email: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        {
          valid: false,
          error: "Запрошення не знайдено",
        },
        { status: 404 }
      );
    }

    // Запрошення вже використовували.
    if (invite.usedAt) {
      return NextResponse.json(
        {
          valid: false,
          error: "Це запрошення вже було використане",
        },
        { status: 410 }
      );
    }

    // Запрошення протерміноване.
    if (invite.expiresAt <= new Date()) {
      return NextResponse.json(
        {
          valid: false,
          error: "Термін дії запрошення закінчився",
        },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Invite verification error:", error);

    return NextResponse.json(
      {
        valid: false,
        error: "Помилка сервера",
      },
      { status: 500 }
    );
  }
}