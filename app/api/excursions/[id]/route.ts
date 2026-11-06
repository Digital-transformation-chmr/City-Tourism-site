import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

// GET — отримання однієї екскурсії
export async function GET(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Некоректний ID екскурсії" },
        { status: 400 }
      );
    }

    const excursion = await prisma.excursion.findUnique({
      where: { id },
    });

    if (!excursion) {
      return NextResponse.json(
        { error: "Екскурсію не знайдено" },
        { status: 404 }
      );
    }

    return NextResponse.json(excursion);
  } catch (error) {
    console.error("GET excursion error:", error);

    return NextResponse.json(
      { error: "Не вдалося отримати екскурсію" },
      { status: 500 }
    );
  }
}

// PATCH — оновлення екскурсії
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Некоректний ID екскурсії" },
        { status: 400 }
      );
    }

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

    if (title !== undefined && (
      typeof title !== "string" || !title.trim()
    )) {
      return NextResponse.json(
        { error: "Назва не може бути порожньою" },
        { status: 400 }
      );
    }

    if (slug !== undefined && (
      typeof slug !== "string" || !slug.trim()
    )) {
      return NextResponse.json(
        { error: "Slug не може бути порожнім" },
        { status: 400 }
      );
    }

    if (description !== undefined && (
      typeof description !== "string" || !description.trim()
    )) {
      return NextResponse.json(
        { error: "Опис не може бути порожнім" },
        { status: 400 }
      );
    }

    if (
      duration !== undefined &&
      (!Number.isInteger(duration) || duration <= 0)
    ) {
      return NextResponse.json(
        { error: "Некоректна тривалість екскурсії" },
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

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title.trim();
    if (slug !== undefined) data.slug = slug.trim();
    if (subtitle !== undefined) data.subtitle = subtitle || null;
    if (description !== undefined) data.description = description.trim();
    if (coverImage !== undefined) data.coverImage = coverImage || null;
    if (duration !== undefined) data.duration = duration;
    if (placeIds !== undefined) data.placeIds = placeIds;
    if (status !== undefined) data.status = status;

    const excursion = await prisma.excursion.update({
      where: { id },
      data,
    });

    return NextResponse.json(excursion);
  } catch (error: any) {
    console.error("PATCH excursion error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Екскурсію не знайдено" },
        { status: 404 }
      );
    }

    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Екскурсія з таким slug вже існує" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Не вдалося оновити екскурсію" },
      { status: 500 }
    );
  }
}

// DELETE — видалення екскурсії
export async function DELETE(
  _request: NextRequest,
  { params }: Context
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Некоректний ID екскурсії" },
        { status: 400 }
      );
    }

    await prisma.excursion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE excursion error:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Екскурсію не знайдено" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Не вдалося видалити екскурсію" },
      { status: 500 }
    );
  }
}