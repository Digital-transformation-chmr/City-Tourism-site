import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const parsedId = Number(id);

    if (isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const article = await prisma.news.findUnique({
      where: {
        id: parsedId,
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Новину не знайдено" },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("[API NEWS ERROR]", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}