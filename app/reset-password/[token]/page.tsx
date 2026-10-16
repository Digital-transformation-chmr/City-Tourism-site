"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = params.token;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Посилання для відновлення пароля некоректне.");
      return;
    }

    if (password.length < 8) {
      setError("Пароль повинен містити щонайменше 8 символів.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не збігаються.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Не вдалося встановити новий пароль. Можливо, посилання вже використано або воно прострочене."
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess("Пароль успішно змінено.");

      window.setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError("Не вдалося з'єднатися із сервером.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-2xl border p-6 md:p-8">
        <p className="text-sm text-neutral-500">
          Адміністративна панель
        </p>

        <h1 className="mt-2 text-2xl font-semibold">
          Відновлення пароля
        </h1>

        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Встановіть новий пароль для свого облікового запису.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Новий пароль
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading || !!success}
              required
              minLength={8}
              className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
              placeholder="Мінімум 8 символів"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Повторіть новий пароль
            </label>

            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              disabled={loading || !!success}
              required
              minLength={8}
              className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition focus:ring-2 focus:ring-neutral-400 disabled:opacity-50"
              placeholder="Повторіть пароль"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700"
            >
              {success} Перенаправляємо на сторінку входу...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full rounded-xl bg-neutral-900 px-5 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Збереження..." : "Зберегти новий пароль"}
          </button>
        </form>
      </div>
    </main>
  );
}