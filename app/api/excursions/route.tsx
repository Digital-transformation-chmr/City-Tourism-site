import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET — список екскурсій
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit")) || 20)
    );

    const status = searchParams.get("status");

    const where = status ? { status } : {};

    const [excursions, total] = await Promise.all([
      prisma.excursion.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.excursion.count({ where }),
    ]);

    return NextResponse.json({
      excursions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET excursions error:", error);

    return NextResponse.json(
      { error: "Не вдалося отримати список екскурсій" },
      { status: 500 }
    );
  }
}

// POST — створення екскурсії
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      slug,
      subtitle,
      description,
      coverImage,
      duration,
      placeIds,
      status,
    } = body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof slug !== "string" ||
      !slug.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "Заповніть назву, slug та опис екскурсії" },
        { status: 400 }
      );
    }

    if (
      duration !== undefined &&
      (!Number.isInteger(duration) || duration <= 0)
    ) {
      return NextResponse.json(
        { error: "Тривалість повинна бути додатним цілим числом" },
        { status: 400 }
      );
    }

    if (
      placeIds !== undefined &&
      (!Array.isArray(placeIds) ||
        !placeIds.every(
          (id: unknown) => Number.isInteger(id) && Number(id) > 0
        ))
    ) {
      return NextResponse.json(
        { error: "Некоректний список місць" },
        { status: 400 }
      );
    }

    const excursion = await prisma.excursion.create({
      data: {
        title: title.trim(),
        slug: slug.trim(),
        subtitle: subtitle || null,
        description: description.trim(),
        coverImage: coverImage || null,
        duration: duration ?? 120,
        placeIds: placeIds ?? [],
        status: status ?? "draft",
      },
    });

    return NextResponse.json(excursion, { status: 201 });
  } catch (error: any) {
    console.error("POST excursion error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Екскурсія з таким slug вже існує" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Не вдалося створити екскурсію" },
      { status: 500 }
    );
  }
}