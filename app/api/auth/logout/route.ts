import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session")?.value;

    if (token) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      await prisma.adminSession.deleteMany({
        where: {
          tokenHash,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: "admin_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);

    return NextResponse.json(
      { error: "Помилка сервера" },
      { status: 500 }
    );
  }
}