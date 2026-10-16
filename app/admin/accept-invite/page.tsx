"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

type InviteInfo = {
  valid: boolean;
  email?: string;
  expiresAt?: string;
  error?: string;
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifyInvite() {
      setChecking(true);

      if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        if (!cancelled) {
          setInvite({
            valid: false,
            error: "Посилання запрошення некоректне або відсутнє.",
          });
          setChecking(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/invites/${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: InviteInfo = await response.json();

        if (!cancelled) {
          setInvite(data);
        }
      } catch {
        if (!cancelled) {
          setInvite({
            valid: false,
            error: "Не вдалося перевірити запрошення. Спробуйте пізніше.",
          });
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    void verifyInvite();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!invite?.valid || !token) {
      setError("Запрошення недійсне.");
      return;
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      setError("Ім’я має містити від 2 до 100 символів.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError("Пароль має містити від 12 до 128 символів.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Паролі не збігаються.");
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
          token,
          name: name.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Не вдалося створити обліковий запис.");
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.replace("/admin/login?registered=1");
      }, 1800);
    } catch {
      setError("Помилка з’єднання із сервером. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f6f8] px-4 py-10 text-slate-900">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-slate-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />

      <section className="relative w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/15">
            <ShieldCheck size={28} strokeWidth={1.7} />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Cherkasy Tourism
          </p>

          <h1 className="text-3xl font-semibold tracking-tight">
            Реєстрація адміністратора
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Створіть обліковий запис, використовуючи запрошення.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          {checking ? (
            <div className="flex flex-col items-center py-12 text-center">
              <LoaderCircle
                className="mb-4 animate-spin text-slate-500"
                size={32}
              />
              <p className="font-medium">Перевіряємо запрошення...</p>
              <p className="mt-2 text-sm text-slate-500">
                Зачекайте кілька секунд.
              </p>
            </div>
          ) : success ? (
            <div className="py-8 text-center">
              <CheckCircle2
                className="mx-auto mb-4 text-emerald-600"
                size={48}
              />
              <h2 className="text-xl font-semibold">
                Обліковий запис створено!
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Зараз перенаправимо вас на сторінку входу.
              </p>
            </div>
          ) : !invite?.valid ? (
            <div className="py-6 text-center">
              <AlertCircle
                className="mx-auto mb-4 text-red-500"
                size={44}
              />
              <h2 className="text-xl font-semibold">
                Запрошення недійсне
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {invite?.error ||
                  "Посилання прострочене або вже використане."}
              </p>

              <Link
                href="/admin/login"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                <ArrowLeft size={16} />
                До сторінки входу
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 shrink-0 text-slate-500"
                    size={19}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">
                      Запрошення для
                    </p>
                    <p className="mt-1 break-all text-sm font-medium">
                      {invite.email}
                    </p>
                  </div>
                </div>

                {invite.expiresAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    Дійсне до:{" "}
                    {new Date(invite.expiresAt).toLocaleString("uk-UA")}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Ім’я та прізвище
                  </label>
                  <div className="relative">
                    <UserRound
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={100}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Наприклад, Іван Петренко"
                      className={`${inputClass} pl-11`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Пароль
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={128}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Мінімум 12 символів"
                      className={`${inputClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Приховати пароль" : "Показати пароль"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    Підтвердження пароля
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={12}
                      maxLength={128}
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Повторіть пароль"
                      className={`${inputClass} pl-11 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Приховати пароль"
                          : "Показати пароль"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    <AlertCircle
                      className="mt-0.5 shrink-0"
                      size={17}
                    />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Створюємо обліковий запис...
                    </>
                  ) : (
                    "Створити обліковий запис"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Захищена реєстрація адміністратора туристичного порталу Черкас.
        </p>
      </section>
    </main>
  );
}
