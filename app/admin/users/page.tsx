
"use client";

import { useCallback, useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
  active: boolean;
  firstLoginAt: string | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Скидання пароля
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sending, setSending] = useState(false);
  const [resetUrl, setResetUrl] = useState("");
  const [resetCopied, setResetCopied] = useState(false);

  // Повідомлення
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Створення запрошення
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteExpiresAt, setInviteExpiresAt] = useState("");
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  // Завантаження користувачів
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Не вдалося завантажити користувачів"
        );
      }

      setUsers(data.users ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка завантаження"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // Створення запрошення адміністратора
  async function createInvite() {
    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setError("Введіть email нового користувача");
      return;
    }

    setCreatingInvite(true);
    setError("");
    setMessage("");
    setInviteUrl("");
    setCopied(false);

    try {
      const response = await fetch("/api/admin/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Не вдалося створити запрошення"
        );
      }

      if (!data.inviteUrl) {
        throw new Error("Сервер не повернув посилання запрошення");
      }

      const generatedUrl = new URL(
        data.inviteUrl,
        window.location.origin
      );

      // Підтримуємо як токен у параметрі ?token=..., так і в шляху.
      const tokenFromQuery = generatedUrl.searchParams.get("token");
      const tokenFromPath = generatedUrl.pathname
        .split("/")
        .filter(Boolean)
        .pop();

      const token = tokenFromQuery || tokenFromPath;

      if (
        !token ||
        token === "accept-invite" ||
        token === "invite"
      ) {
        throw new Error("Не вдалося отримати токен запрошення");
      }

      const registrationUrl = new URL(
        `/invite/${encodeURIComponent(token)}`,
        window.location.origin
      );

      setInviteUrl(registrationUrl.toString());
      setInviteExpiresAt(
        data.expiresAt ? new Date(data.expiresAt).toISOString() : ""
      );

      setMessage(`Запрошення для ${email} створено.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Помилка створення запрошення"
      );
    } finally {
      setCreatingInvite(false);
    }
  }

  // Копіювання посилання запрошення
  async function copyInviteUrl() {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setError("");
    } catch {
      setError(
        "Не вдалося скопіювати посилання. Виділіть його та скопіюйте вручну."
      );
    }
  }

  // Закриття модального вікна запрошення
  function closeInviteModal() {
    if (creatingInvite) return;

    setShowInviteModal(false);
    setInviteEmail("");
    setInviteUrl("");
    setInviteExpiresAt("");
    setCopied(false);
  }

  // Відкриття вікна скидання пароля
  function openResetModal(user: User) {
    setSelectedUser(user);
    setResetUrl("");
    setResetCopied(false);
    setError("");
    setMessage("");
  }

  // Закриття вікна скидання пароля
  function closeResetModal() {
    if (sending) return;

    setSelectedUser(null);
    setResetUrl("");
    setResetCopied(false);
  }

  // Створення посилання для скидання пароля
  async function sendResetLink() {
    if (!selectedUser) return;

    setSending(true);
    setError("");
    setMessage("");
    setResetUrl("");
    setResetCopied(false);

    try {
      const response = await fetch(
        "/api/admin/users/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: selectedUser.email,
            returnUrl: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Не вдалося створити посилання"
        );
      }

      if (!data.resetUrl) {
        throw new Error(
          "API не повернув посилання для скидання пароля"
        );
      }

      setResetUrl(data.resetUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Помилка створення посилання"
      );
    } finally {
      setSending(false);
    }
  }

  // Копіювання посилання скидання пароля
  async function copyResetUrl() {
    if (!resetUrl) return;

    try {
      await navigator.clipboard.writeText(resetUrl);
      setResetCopied(true);
      setError("");
    } catch {
      setError(
        "Не вдалося скопіювати посилання. Виділіть його та скопіюйте вручну."
      );
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8">
          <p className="text-sm text-neutral-500">
            Адміністративна панель
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Користувачі
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Список облікових записів та керування доступом.
          </p>
        </div>

        {/* Повідомлення про успіх */}
        {message && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700">
            <p>{message}</p>

            <button
              type="button"
              onClick={() => setMessage("")}
              className="shrink-0 text-lg leading-none"
              aria-label="Закрити повідомлення"
            >
              ×
            </button>
          </div>
        )}

        {/* Повідомлення про помилку */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-lg leading-none"
              aria-label="Закрити повідомлення про помилку"
            >
              ×
            </button>
          </div>
        )}

        {/* Список користувачів */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200">
          <div className="flex flex-col gap-4 border-b border-neutral-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium">Усі користувачі</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Кількість: {users.length}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setInviteEmail("");
                  setInviteUrl("");
                  setInviteExpiresAt("");
                  setCopied(false);
                  setShowInviteModal(true);
                }}
                className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
              >
                + Додати користувача
              </button>

              <button
                type="button"
                onClick={() => void loadUsers()}
                disabled={loading}
                className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition hover:bg-neutral-100 disabled:opacity-50"
              >
                {loading ? "Оновлення..." : "Оновити"}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-neutral-500">
              Завантаження користувачів...
            </p>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium">
                Користувачів поки немає
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                Натисніть «Додати користувача», щоб створити запрошення.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {users.map((user) => (
                <div
                  key={user.email}
                  className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium">{user.name}</h3>

                    <p className="mt-1 break-all text-sm text-neutral-500">
                      {user.email}
                    </p>

                    <p className="mt-2 text-sm text-neutral-500">
                      {user.firstLoginAt
                        ? `Перший вхід: ${new Date(
                            user.firstLoginAt
                          ).toLocaleDateString("uk-UA")}`
                        : "Ще не входив у систему"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-green-500/10 text-green-700"
                          : "bg-neutral-500/10 text-neutral-500"
                      }`}
                    >
                      {user.active ? "Активний" : "Неактивний"}
                    </span>

                    <button
                      type="button"
                      onClick={() => openResetModal(user)}
                      className="rounded-lg border border-neutral-200 px-4 py-2 text-sm transition hover:bg-neutral-100"
                    >
                      Скинути пароль
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальне вікно створення запрошення */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeInviteModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-dialog-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="invite-dialog-title"
                  className="text-xl font-semibold"
                >
                  Додати користувача
                </h2>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Введіть email нового адміністратора. Посилання діятиме
                  протягом 4 днів.
                </p>
              </div>

              <button
                type="button"
                onClick={closeInviteModal}
                disabled={creatingInvite}
                className="rounded-lg px-2 py-1 text-2xl leading-none text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>

            <div className="mt-6">
              <label
                htmlFor="invite-email"
                className="mb-2 block text-sm font-medium"
              >
                Email користувача
              </label>

              <input
                id="invite-email"
                type="email"
                autoComplete="email"
                required
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                disabled={creatingInvite || Boolean(inviteUrl)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
              />
            </div>

            {!inviteUrl ? (
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  disabled={creatingInvite}
                  className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition hover:bg-neutral-100 disabled:opacity-50"
                >
                  Скасувати
                </button>

                <button
                  type="button"
                  onClick={() => void createInvite()}
                  disabled={creatingInvite || !inviteEmail.trim()}
                  className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingInvite
                    ? "Створення..."
                    : "Створити запрошення"}
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <p className="text-sm font-medium text-green-800">
                    Запрошення створено
                  </p>

                  <p className="mt-1 text-sm leading-5 text-neutral-600">
                    Скопіюйте посилання та надішліть його користувачу.
                    Обліковий запис буде створено після реєстрації.
                  </p>
                </div>

                <label
                  htmlFor="invite-url"
                  className="mb-2 mt-5 block text-sm font-medium"
                >
                  Посилання для реєстрації
                </label>

                <textarea
                  id="invite-url"
                  readOnly
                  rows={4}
                  value={inviteUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="w-full resize-y break-all rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 outline-none"
                />

                {inviteExpiresAt && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Дійсне до:{" "}
                    {new Date(inviteExpiresAt).toLocaleString("uk-UA")}
                  </p>
                )}

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeInviteModal}
                    className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm transition hover:bg-neutral-100"
                  >
                    Готово
                  </button>

                  <button
                    type="button"
                    onClick={() => void copyInviteUrl()}
                    className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                  >
                    {copied
                      ? "Скопійовано ✓"
                      : "Скопіювати посилання"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальне вікно скидання пароля */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !sending) {
              closeResetModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="reset-dialog-title"
                  className="text-xl font-semibold"
                >
                  {resetUrl
                    ? "Посилання для скидання пароля"
                    : "Скинути пароль?"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Користувач:{" "}
                  <strong className="break-all">
                    {selectedUser.email}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                disabled={sending}
                onClick={closeResetModal}
                className="rounded-lg px-2 py-1 text-2xl leading-none text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                aria-label="Закрити"
              >
                ×
              </button>
            </div>

            {!resetUrl ? (
              <>
                <p className="mt-4 text-sm leading-6 text-neutral-500">
                  Створити одноразове посилання для встановлення нового
                  пароля. Після створення його можна буде скопіювати та
                  передати користувачу вручну.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={closeResetModal}
                    className="rounded-lg border border-neutral-200 px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Скасувати
                  </button>

                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => void sendResetLink()}
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-700 disabled:opacity-50"
                  >
                    {sending ? "Створення..." : "Створити посилання"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                  <p className="text-sm font-medium text-green-800">
                    Посилання отримано
                  </p>

                  <p className="mt-1 text-sm leading-5 text-neutral-600">
                    Скопіюй посилання та передай його користувачу.
                  </p>
                </div>

                <label
                  htmlFor="reset-url"
                  className="mb-2 mt-5 block text-sm font-medium"
                >
                  Посилання для скидання пароля
                </label>

                <textarea
                  id="reset-url"
                  readOnly
                  rows={4}
                  value={resetUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="w-full resize-y break-all rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm leading-6 outline-none"
                />

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeResetModal}
                    className="rounded-lg border border-neutral-200 px-4 py-2.5 text-sm hover:bg-neutral-100"
                  >
                    Готово
                  </button>

                  <button
                    type="button"
                    onClick={() => void copyResetUrl()}
                    className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700"
                  >
                    {resetCopied
                      ? "Скопійовано ✓"
                      : "Скопіювати посилання"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
