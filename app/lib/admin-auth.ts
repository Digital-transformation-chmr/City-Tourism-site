
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import prisma from "@/app/lib/prisma";

export async function getSessionAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    return null;
  }

  // У БД зберігається SHA-256 хеш, а не сам токен.
  const tokenHash = createHash("sha256")
    .update(token)
    .digest("hex");

  const session = await prisma.adminSession.findUnique({
    where: {
      tokenHash,
    },
    select: {
      id: true,
      adminId: true,
      expiresAt: true,
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Перевіряємо термін дії сесії.
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  // Не дозволяємо неактивним користувачам
  // або користувачам без ролі admin працювати з API.
  if (!session.admin.active || session.admin.role !== "admin") {
    return null;
  }

  return {
    user: session.admin,
    admin: session.admin,
    session: {
      id: session.id,
      adminId: session.adminId,
      expiresAt: session.expiresAt,
    },
  };
}
