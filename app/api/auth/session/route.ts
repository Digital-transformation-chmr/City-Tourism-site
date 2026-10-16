import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const session = await prisma.adminSession.findUnique({
      where: {
        tokenHash,
      },
      include: {
        admin: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Сесія протермінована
    if (session.expiresAt <= new Date()) {
      await prisma.adminSession.delete({
        where: {
          id: session.id,
        },
      });

      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Адміна деактивували
    if (!session.admin.active) {
      await prisma.adminSession.delete({
        where: {
          id: session.id,
        },
      });

      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: session.admin.id,
        name: session.admin.name,
        role: session.admin.role,
      },
    });
  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}