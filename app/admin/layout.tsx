import { cookies } from "next/headers";
import crypto from "crypto";
import { redirect } from "next/navigation";

import prisma from "@/app/lib/prisma";

import LogoutButton from "./components/LogoutButton";
import AdminBar from "./components/AdminBar";

async function getAdminSession() {
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

  return {
    token,
    admin: session.admin,
  };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // Немає валідної адмінської сесії —
  // відправляємо на сторінку входу.
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen">
      <AdminBar />

      {/* DEBUG: інформація про поточну сесію */}
      <div className="fixed bottom-4 left-4 z-[9999] max-w-md rounded-xl border bg-black px-4 py-3 text-sm text-white shadow-xl">
        <div>
          <span className="opacity-50">Адмін:</span>{" "}
          {session.admin.name}
        </div>

        <div className="mt-1">
          <span className="opacity-50">Token:</span>{" "}
          <span className="break-all">
            {session.token}
          </span>
        </div>

        <div className="mt-1">
          <span className="opacity-50">Session ID:</span>{" "}
          {session.admin.id}
        </div>
      </div>

      <main className="w-full">
        {children}

        <LogoutButton />
      </main>
    </div>
  );
}