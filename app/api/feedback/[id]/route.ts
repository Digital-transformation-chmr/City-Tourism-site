import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const ALLOWED_STATUSES = new Set([
  "new",
  "in_progress",
  "resolved",
  "rejected",
]);

// ============================================================
// PATCH — зміна статусу feedback
// ============================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const feedbackId = Number(id);

    if (!Number.isInteger(feedbackId) || feedbackId <= 0) {
      return NextResponse.json(
        {
          error: "Некоректний ID звернення",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const status = body?.status;

    if (
      typeof status !== "string" ||
      !ALLOWED_STATUSES.has(status)
    ) {
      return NextResponse.json(
        {
          error: "Некоректний статус",
        },
        {
          status: 400,
        }
      );
    }

    const existingFeedback = await prisma.feedback.findUnique({
      where: {
        id: feedbackId,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        {
          error: "Звернення не знайдено",
        },
        {
          status: 404,
        }
      );
    }

    const feedback = await prisma.feedback.update({
      where: {
        id: feedbackId,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        feedback,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("FEEDBACK PATCH ERROR:", error);

    return NextResponse.json(
      {
        error: "Не вдалося змінити статус звернення",
      },
      {
        status: 500,
      }
    );
  }
}

