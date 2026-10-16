import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getSessionAdmin } from "@/app/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionAdmin();

    if (!auth) {
      return NextResponse.json(
        { error: "Потрібно увійти в систему" },
        { status: 401 },
      );
    }
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        email: true,
        role: true,
        active: true,
        firstLoginAt: true,
        createdAt: true,
      },
    });

    const users = admins.map((admin) => ({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      active: admin.active,
      firstLoginAt: admin.firstLoginAt?.toISOString() ?? null,
      createdAt: admin.createdAt.toISOString(),
      hasLoggedIn: admin.firstLoginAt !== null,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Помилка отримання списку адміністраторів:", error);

    return NextResponse.json(
      { error: "Не вдалося отримати список користувачів" },
      { status: 500 },
    );
  }
}