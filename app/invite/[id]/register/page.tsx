
"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type InviteData = {
  valid: boolean;
  email?: string;
  error?: string;
};

export default function RegisterInvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkInvite() {
      try {
        const response = await fetch(
          `/api/admin/invite/${encodeURIComponent(id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: InviteData = await response.json();

        if (!cancelled) {
          setInvite(
            response.ok
              ? data
              : {
                  valid: false,
                  error: data.error || "Запрошення недійсне",
                },
          );
        }
      } catch {
        if (!cancelled) {
          setInvite({
            valid: false,
            error: "Не вдалося перевірити запрошення",
          });
        }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Ім’я має містити щонайменше 2 символи");
      return;
    }

    if (password.length < 8) {
      setError("Пароль має містити щонайменше 8 символів");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не збігаються");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: id,
          name: trimmedName,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося завершити реєстрацію");
      }

      router.push("/login?registered=1");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Сталася помилка під час реєстрації",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p className="mb-4 text-lg">Перевіряємо запрошення...</p>
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!invite?.valid) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl border p-8 text-center">
          <div className="mb-4 text-5xl text-red-500">×</div>

          <h1 className="text-2xl font-semibold">
            Запрошення недійсне
          </h1>

          <p className="mt-3 text-sm opacity-70">
            {invite?.error || "Посилання прострочене або вже використане."}
          </p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-lg border px-5 py-3 transition hover:opacity-70"
          >
            На сайт
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-sm sm:p-8">
          <div className="mb-8">
            <p className="text-sm text-neutral-500">
              Реєстрація адміністратора
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Створення акаунта
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Заповніть дані, щоб завершити реєстрацію.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs text-neutral-500">
              Email запрошення
            </p>
            <p className="mt-1 break-all text-sm font-medium">
              {invite.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium"
              >
                Ім’я та прізвище
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Введіть ім’я"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Пароль
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Мінімум 8 символів"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium"
              >
                Повторіть пароль
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Повторіть пароль"
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Створення акаунта..." : "Зареєструватися"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-neutral-500">
            Після реєстрації ви зможете увійти до адміністративної панелі.
          </p>
        </div>
      </div>
    </main>
  );
}
