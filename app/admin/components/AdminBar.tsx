import { cookies } from "next/headers";
import crypto from "crypto";
import Link from "next/link";

import prisma from "@/app/lib/prisma";
import LogoutButton from "./LogoutButton";

export default async function AdminBar() {
  const cookieStore = await cookies();

  const token = cookieStore.get("admin_session")?.value;

  if (!token) {
    return null;
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
    return null;
  }

  if (session.expiresAt <= new Date()) {
    return null;
  }

  if (!session.admin.active) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border bg-background/80 p-1 shadow-lg backdrop-blur-md">
        <Link
          href="/site"
          className="rounded-full px-4 py-2 text-sm transition hover:bg-black/10"
        >
          Сайт
        </Link>

        <Link
          href="/admin"
          className="rounded-full px-4 py-2 text-sm transition hover:bg-black/10"
        >
          Адмін-панель
        </Link>

        <LogoutButton />
      </div>
    </div>
  );
}