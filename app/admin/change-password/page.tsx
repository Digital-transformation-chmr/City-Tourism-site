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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося завантажити користувачів");
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

  async function sendResetLink() {
    if (!selectedUser) return;

    setSending(true);
    setError("");
    setMessage("");

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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося надіслати лист");
      }

      setMessage(
        `Посилання для скидання пароля надіслано на ${selectedUser.email}.`
      );
      setSelectedUser(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Помилка надсилання листа"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm text-neutral-500">
            Адміністративна панель
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Користувачі
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            Список облікових записів та керування відновленням паролів.
          </p>
        </div>

        {message && (
          <div className="mb-5 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-medium">Усі користувачі</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Кількість: {users.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm transition hover:bg-neutral-100 disabled:opacity-50"
            >
              Оновити
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-neutral-500">
              Завантаження користувачів...
            </p>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">
              Користувачів поки немає.
            </p>
          ) : (
            <div className="divide-y">
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
                        ? `Остання інформація про перший вхід: ${new Date(
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
                      {user.active ? "Active" : "Unactive"}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setError("");
                      }}
                      className="rounded-lg border px-4 py-2 text-sm transition hover:bg-neutral-100"
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

      {selectedUser && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !sending) {
              setSelectedUser(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            className="w-full max-w-md rounded-2xl border bg-white p-6 text-neutral-900 shadow-2xl"
          >
            <h2
              id="reset-dialog-title"
              className="text-xl font-semibold"
            >
              Скинути пароль?
            </h2>

            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Надіслати на адресу{" "}
              <strong className="break-all">
                {selectedUser.email}
              </strong>{" "}
              лист із одноразовим посиланням для встановлення нового пароля?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={sending}
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                Скасувати
              </button>

              <button
                type="button"
                disabled={sending}
                onClick={() => void sendResetLink()}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                {sending ? "Надсилання..." : "Підтвердити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}