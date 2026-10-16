
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Потрібно увійти в систему" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const currentPassword =
      typeof body.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body.newPassword === "string"
        ? body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Заповніть усі обов'язкові поля" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Новий пароль повинен містити щонайменше 8 символів" },
        { status: 400 },
      );
    }

    const result = await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Пароль успішно змінено",
    });
  } catch (error) {
    console.error("Помилка зміни пароля:", error);

    return NextResponse.json(
      { error: "Не вдалося змінити пароль. Перевірте поточний пароль." },
      { status: 400 },
    );
  }
}
