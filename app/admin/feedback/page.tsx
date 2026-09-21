"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Search,
  MessageCircle,
  Bug,
  PlusCircle,
  Trash2,
  RefreshCw,
  Inbox,
  X,
  Mail,
  CalendarDays,
  Image as ImageIcon,
} from "lucide-react";

type Feedback = {
  id: number;
  email: string;
  category: string;
  message: string;
  images: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  review: "Відгук",
  error: "Помилка",
  resource: "Запропонувати ресурс",
  delete: "Видалити ресурс",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Нове",
  in_progress: "В роботі",
  resolved: "Виконано",
  rejected: "Відхилено",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  review: MessageCircle,
  error: Bug,
  resource: PlusCircle,
  delete: Trash2,
};

const STATUS_ORDER: Record<string, number> = {
  new: 0,
  in_progress: 1,
  resolved: 2,
  rejected: 3,
};

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [refreshing, setRefreshing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] =
    useState<Feedback | null>(null);

  const fetchFeedbacks = async () => {
    try {
      setRefreshing(true);

      const response = await fetch("/api/feedback", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Не вдалося завантажити feedback");
      }

      const data = await response.json();

      setFeedbacks(
        Array.isArray(data) ? data : data.feedbacks ?? []
      );
    } catch (error) {
      console.error("Помилка завантаження feedback:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
    const updateFeedbackStatus = async (id: number, status: string) => {
    try {
        const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status,
        }),
        });

        const data = await response.json();

        if (!response.ok) {
        throw new Error(
            data?.error ?? "Не вдалося змінити статус"
        );
        }

        const updatedFeedback = data.feedback;

        // Оновлюємо список
        setFeedbacks((current) =>
        current.map((feedback) =>
            feedback.id === id
            ? updatedFeedback
            : feedback
        )
        );

        // Оновлюємо feedback у відкритому modal
        setSelectedFeedback(updatedFeedback);
    } catch (error) {
        console.error("Помилка зміни статусу:", error);

        alert(
        error instanceof Error
            ? error.message
            : "Не вдалося змінити статус"
        );
    }
    };



  useEffect(() => {
    fetchFeedbacks();
  }, []);

  // Закриття модального через Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedFeedback(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Блокуємо scroll сторінки при відкритому modal
  useEffect(() => {
    if (!selectedFeedback) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedFeedback]);

  const filteredFeedbacks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return feedbacks
      .filter((feedback) => {
        const matchesSearch =
          !normalizedSearch ||
          feedback.email.toLowerCase().includes(normalizedSearch) ||
          feedback.message.toLowerCase().includes(normalizedSearch) ||
          String(feedback.id).includes(normalizedSearch);

        const matchesStatus =
          statusFilter === "all" ||
          feedback.status === statusFilter;

        const matchesCategory =
          categoryFilter === "all" ||
          feedback.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        // Спочатку статуси за пріоритетом:
        // new → in_progress → resolved → rejected
        const statusDifference =
          (STATUS_ORDER[a.status] ?? 99) -
          (STATUS_ORDER[b.status] ?? 99);

        if (statusDifference !== 0) {
          return statusDifference;
        }

        // Якщо статус однаковий —
        // новіші звернення першими
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });
  }, [
    feedbacks,
    search,
    statusFilter,
    categoryFilter,
  ]);

  const newCount = feedbacks.filter(
    (item) => item.status === "new"
  ).length;

  const inProgressCount = feedbacks.filter(
    (item) => item.status === "in_progress"
  ).length;

  const resolvedCount = feedbacks.filter(
    (item) => item.status === "resolved"
  ).length;

  return (
    <main className="min-h-screen bg-[var(--paper-l)] text-[var(--ink)]">
      <div className="relative z-10 mx-auto max-w-[1600px] px-5 py-8 sm:px-8 lg:px-12">
        {/* HEADER */}
        <div className="mb-10">
          <Link
            href="/admin"
            className="mb-7 inline-flex items-center gap-2 text-sm text-black/55 no-underline transition-colors hover:text-black"
          >
            <ArrowLeft size={16} />
            Назад до адміністративної панелі
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 text-sm uppercase tracking-[0.18em] text-black/45">
                Адміністративна панель
              </div>

              <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
                Зворотний зв'язок
              </h1>

              <p className="mt-4 max-w-2xl text-base text-black/55 sm:text-lg">
                Перегляд звернень користувачів та повідомлень
                про роботу туристичного порталу.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchFeedbacks}
              disabled={refreshing}
              className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm shadow-sm transition-all hover:border-black/20 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Оновити
            </button>
          </div>
        </div>

        {/* STATISTICS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Всього звернень"
            value={feedbacks.length}
          />

          <StatCard
            label="Нові"
            value={newCount}
            accent="yellow"
          />

          <StatCard
            label="В роботі"
            value={inProgressCount}
            accent="blue"
          />

          <StatCard
            label="Виконано"
            value={resolvedCount}
            accent="green"
          />
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            {/* SEARCH */}
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/40"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Пошук за поштою, текстом або ID..."
                className="w-full rounded-xl border border-black/10 bg-[var(--paper-l)] py-3 pl-11 pr-4 text-[var(--ink)] outline-none transition-colors placeholder:text-black/35 focus:border-black/30"
              />
            </div>

            {/* STATUS */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="cursor-pointer rounded-xl border border-black/10 bg-[var(--paper-l)] px-4 py-3 text-[var(--ink)] outline-none focus:border-black/30"
            >
              <option value="all">Усі статуси</option>
              <option value="new">Нове</option>
              <option value="in_progress">
                В роботі
              </option>
              <option value="resolved">Виконано</option>
              <option value="rejected">Відхилено</option>
            </select>

            {/* CATEGORY */}
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
              className="cursor-pointer rounded-xl border border-black/10 bg-[var(--paper-l)] px-4 py-3 text-[var(--ink)] outline-none focus:border-black/30"
            >
              <option value="all">Усі категорії</option>
              <option value="review">Відгук</option>
              <option value="error">Помилка</option>
              <option value="resource">
                Запропонувати ресурс
              </option>
              <option value="delete">
                Видалити ресурс
              </option>
            </select>
          </div>
        </div>

        {/* LIST */}
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {/* TABLE HEADER */}
          <div className="hidden grid-cols-[70px_1.2fr_1fr_2fr_130px_140px_60px] gap-4 border-b border-black/10 px-5 py-4 text-xs uppercase tracking-[0.12em] text-black/40 xl:grid">
            <div>ID</div>
            <div>Пошта</div>
            <div>Категорія</div>
            <div>Повідомлення</div>
            <div>Статус</div>
            <div>Дата</div>
            <div />
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex items-center gap-3 text-black/50">
                <RefreshCw
                  size={18}
                  className="animate-spin"
                />
                Завантаження звернень...
              </div>
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            filteredFeedbacks.length === 0 && (
              <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-[var(--paper-l)]">
                  <Inbox
                    size={26}
                    className="text-black/40"
                  />
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Звернень не знайдено
                </h2>

                <p className="mt-2 max-w-md text-sm text-black/50">
                  Спробуйте змінити фільтри або перевірити
                  пошуковий запит.
                </p>
              </div>
            )}

          {/* FEEDBACKS */}
          {!loading &&
            filteredFeedbacks.map((feedback) => {
              const Icon =
                CATEGORY_ICONS[feedback.category] ??
                MessageCircle;

              return (
                <button
                  key={feedback.id}
                  type="button"
                  onClick={() =>
                    setSelectedFeedback(feedback)
                  }
                  className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-left transition-colors hover:bg-black/[0.025]"
                >
                  {/* DESKTOP */}
                  <div className="hidden grid-cols-[70px_1.2fr_1fr_2fr_130px_140px_60px] items-center gap-4 border-b border-black/10 px-5 py-5 last:border-b-0 xl:grid">
                    <div className="text-sm text-black/45">
                      #{feedback.id}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {feedback.email}
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-black/10 bg-[var(--paper-l)]">
                        <Icon size={16} />
                      </div>

                      <span className="truncate text-sm">
                        {CATEGORY_LABELS[
                          feedback.category
                        ] ?? feedback.category}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm text-black/55">
                        {feedback.message}
                      </p>
                    </div>

                    <div>
                      <StatusBadge
                        status={feedback.status}
                      />
                    </div>

                    <div className="text-sm text-black/45">
                      {formatDate(feedback.createdAt)}
                    </div>

                    <div className="flex justify-end">
                      <ArrowUpRight
                        size={17}
                        className="text-black/30 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black"
                      />
                    </div>
                  </div>

                  {/* MOBILE */}
                  <div className="border-b border-black/10 p-5 last:border-b-0 xl:hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-black/10 bg-[var(--paper-l)]">
                          <Icon size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {feedback.email}
                          </p>

                          <p className="mt-1 text-xs text-black/45">
                            #{feedback.id} ·{" "}
                            {CATEGORY_LABELS[
                              feedback.category
                            ] ?? feedback.category}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        size={17}
                        className="flex-shrink-0 text-black/30"
                      />
                    </div>

                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/55">
                      {feedback.message}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <StatusBadge
                        status={feedback.status}
                      />

                      <span className="text-xs text-black/45">
                        {formatDate(feedback.createdAt)}
                      </span>
                    </div>

                    {feedback.images?.length > 0 && (
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-black/45">
                        <ImageIcon size={14} />
                        Фото: {feedback.images.length}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* RESULTS COUNT */}
        {!loading &&
          filteredFeedbacks.length > 0 && (
            <div className="mt-5 text-sm text-black/45">
              Показано: {filteredFeedbacks.length} з{" "}
              {feedbacks.length}
            </div>
          )}
      </div>

      {/* ================================================== */}
      {/* MODAL */}
      {/* ================================================== */}

      {selectedFeedback && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedFeedback(null);
            }
          }}
        >
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-black/10 bg-[var(--paper-l)] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-5 border-b border-black/10 px-6 py-5 sm:px-7">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.15em] text-black/40">
                    Звернення #{selectedFeedback.id}
                  </span>


            <select
            value={selectedFeedback.status}
            onChange={(event) =>
                updateFeedbackStatus(
                selectedFeedback.id,
                event.target.value
                )
            }
            className={`cursor-pointer appearance-none rounded-full border px-3 py-1 text-xs font-medium outline-none transition-colors ${
                selectedFeedback.status === "new"
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-700"
                : selectedFeedback.status === "in_progress"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-700"
                    : selectedFeedback.status === "resolved"
                    ? "border-green-500/30 bg-green-500/10 text-green-700"
                    : "border-red-500/30 bg-red-500/10 text-red-700"
            }`}
            >
            <option value="new">Нове</option>
            <option value="in_progress">В роботі</option>
            <option value="resolved">Виконано</option>
            <option value="rejected">Відхилено</option>
            </select>


                </div>

                <h2 className="text-2xl font-bold sm:text-3xl">
                  {CATEGORY_LABELS[
                    selectedFeedback.category
                  ] ?? selectedFeedback.category}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedFeedback(null)
                }
                className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/55 transition-colors hover:bg-black/5 hover:text-black"
                aria-label="Закрити"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="overflow-y-auto px-6 py-6 sm:px-7">
              {/* INFO */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-black/40">
                    <Mail size={14} />
                    Електронна пошта
                  </div>

                  <a
                    href={`mailto:${selectedFeedback.email}`}
                    className="break-all text-sm font-medium text-[var(--ink)] no-underline hover:underline"
                  >
                    {selectedFeedback.email}
                  </a>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-black/40">
                    <CalendarDays size={14} />
                    Дата створення
                  </div>

                  <div className="text-sm font-medium">
                    {formatDate(
                      selectedFeedback.createdAt
                    )}
                  </div>
                </div>
              </div>

              {/* MESSAGE */}
              <div className="mt-5">
                <div className="mb-2 text-xs uppercase tracking-wider text-black/40">
                  Повідомлення
                </div>

                <div className="rounded-2xl border border-black/10 bg-white p-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-black/75">
                    {selectedFeedback.message}
                  </p>
                </div>
              </div>

              {/* IMAGES */}
              {selectedFeedback.images?.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-black/40">
                    <ImageIcon size={14} />
                    Додані фотографії (
                    {selectedFeedback.images.length})
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedFeedback.images.map(
                      (image, index) => (
                        <a
                          key={`${image}-${index}`}
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square overflow-hidden rounded-2xl border border-black/10 bg-white"
                        >
                          <img
                            src={image}
                            alt={`Фото звернення ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                            <ArrowUpRight
                              size={22}
                              className="text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                            />
                          </div>
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col-reverse gap-3 border-t border-black/10 bg-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="text-xs text-black/40">
                Оновлено:{" "}
                {formatDate(
                  selectedFeedback.updatedAt
                )}
              </div>

              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedFeedback.email}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] no-underline transition-colors hover:bg-black/5"
                >
                  <Mail size={15} />
                  Написати
                </a>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedFeedback(null)
                  }
                  className="cursor-pointer rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
                >
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "yellow" | "blue" | "green";
}) {
  const accentStyles = {
    yellow: {
      wrapper:
        "border-yellow-500/20 bg-yellow-500/[0.06]",
      value: "text-yellow-700",
    },
    blue: {
      wrapper:
        "border-blue-500/20 bg-blue-500/[0.06]",
      value: "text-blue-700",
    },
    green: {
      wrapper:
        "border-green-500/20 bg-green-500/[0.06]",
      value: "text-green-700",
    },
  };

  const styles = accent
    ? accentStyles[accent]
    : {
        wrapper: "border-black/10 bg-white",
        value: "text-[var(--ink)]",
      };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${styles.wrapper}`}
    >
      <div className="text-sm text-black/50">
        {label}
      </div>

      <div
        className={`mt-2 text-3xl font-bold ${styles.value}`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "border-yellow-500/30 bg-yellow-500/10 text-yellow-700",
    in_progress:
      "border-blue-500/30 bg-blue-500/10 text-blue-700",
    resolved:
      "border-green-500/30 bg-green-500/10 text-green-700",
    rejected:
      "border-red-500/30 bg-red-500/10 text-red-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${
        styles[status] ??
        "border-black/10 bg-black/5 text-black/55"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

