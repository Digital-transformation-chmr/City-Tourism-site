import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email не вказано" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Пароль не вказано" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (!admin || !admin.active) {
      return NextResponse.json(
        { error: "Неправильний email або пароль" },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      admin.keyHash
    );

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Неправильний email або пароль" },
        { status: 401 }
      );
    }

    // Створюємо випадковий session token
    const token = crypto.randomBytes(32).toString("hex");

    // У БД зберігаємо тільки hash токена
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const expiresAt = new Date(
      Date.now() + SESSION_DURATION
    );

    await prisma.adminSession.create({
      data: {
        adminId: admin.id,
        tokenHash,
        expiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}