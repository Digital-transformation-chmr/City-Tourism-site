"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Введіть email");
      return;
    }

    if (!password) {
      setError("Введіть пароль");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Неправильний email або пароль");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Не вдалося виконати вхід");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-8">
          <div className="mb-8">
            <p className="text-sm opacity-60">
              Адміністративна панель
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Вхід
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition focus:ring-2"
              />
            </div>

            {/* Password */}
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Введіть пароль"
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none transition focus:ring-2"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-5 py-3 text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Вхід..." : "Увійти"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}