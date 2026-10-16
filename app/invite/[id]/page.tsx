
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type InviteData = {
  valid: boolean;
  email?: string;
  expiresAt?: string;
  error?: string;
};

export default function InvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkInvite() {
      setLoading(true);
      setInvite(null);

      try {
        const response = await fetch(
          `/api/admin/invite/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: InviteData = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setInvite({
            valid: false,
            error: data.error || `Помилка перевірки запрошення (${response.status})`,
          });
          return;
        }

        setInvite(data);
      } catch {
        if (cancelled) return;

        setInvite({
          valid: false,
          error: "Не вдалося з'єднатися із сервером. Спробуйте ще раз.",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkInvite();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mb-4 text-lg">
            Перевіряємо запрошення...
          </div>

          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!invite?.valid) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl text-red-500">×</div>

          <h1 className="text-2xl font-semibold">
            Запрошення недійсне
          </h1>

          <p className="mt-3 break-words text-sm opacity-70">
            {invite?.error ||
              "Запрошення не знайдено, воно прострочене або вже використане."}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border px-5 py-3 transition hover:opacity-70"
            >
              Спробувати ще раз
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg bg-black px-5 py-3 text-white transition hover:opacity-80"
            >
              На сайт
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-8">
          <div className="mb-8">
            <p className="text-sm opacity-60">
              Запрошення адміністратора
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Вас запрошено
            </h1>

            <p className="mt-3 text-sm opacity-70">
              Перевірте адресу електронної пошти та продовжте реєстрацію.
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm opacity-60">Email</p>

            <p className="mt-1 break-all font-medium">
              {invite.email}
            </p>
          </div>

          {invite.expiresAt && (
            <p className="mt-4 text-sm opacity-60">
              Запрошення дійсне до{" "}
              {new Date(invite.expiresAt).toLocaleString("uk-UA")}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              router.push(
                `/invite/${encodeURIComponent(id)}/register`,
              );
            }}
            className="mt-8 w-full rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-80"
          >
            Продовжити
          </button>
        </div>
      </div>
    </main>
  );
}
