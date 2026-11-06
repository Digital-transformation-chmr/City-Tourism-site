
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  Trash2,
} from "lucide-react";

type ExcursionRow = {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  duration: number;
  status: string;
};

export default function ExcursionTableClient({
  excursions,
  page,
  totalPages,
  total,
}: {
  excursions: ExcursionRow[];
  page: number;
  totalPages: number;
  total: number;
}) {
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const goToPage = (nextPage: number) => {
    router.push(`/admin/tableexc?page=${nextPage}`);
  };

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number,
    title: string
  ) => {
    event.stopPropagation();

    const confirmed = confirm(
      `Видалити екскурсію «${title}»? Цю дію неможливо скасувати.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`/api/excursions/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || "Не вдалося видалити екскурсію"
        );
      }

      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Сталася помилка"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "published":
        return "Опублікована";
      case "draft":
        return "Чернетка";
      default:
        return status || "—";
    }
  };

  return (
    <div className="space-y-4">

      {/* Інформація */}
      <div className="flex items-center justify-between text-sm text-[var(--ink)]/55">
        <span>Усього екскурсій: {total}</span>

        <span>
          Сторінка {page} з {totalPages}
        </span>
      </div>

      {/* Таблиця */}
      <div className="overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">

            <thead className="bg-[var(--paper-l)] text-xs uppercase tracking-wider text-[var(--ink)]/55">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Назва
                </th>

                <th className="px-5 py-4 font-semibold">
                  Slug
                </th>

                <th className="px-5 py-4 font-semibold">
                  Тривалість
                </th>

                <th className="px-5 py-4 font-semibold">
                  Статус
                </th>

                <th className="px-5 py-4 text-right font-semibold">
                  Дії
                </th>
              </tr>
            </thead>

            <tbody>
              {excursions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-14 text-center text-sm text-[var(--ink)]/50"
                  >
                    Екскурсій поки немає.

                    <a
                      href="/admin/excursions"
                      className="ml-1 font-semibold text-[var(--accent)] hover:underline"
                    >
                      Створити першу
                    </a>
                  </td>
                </tr>
              ) : (
                excursions.map((excursion) => (
                  <tr
                    key={excursion.id}
                    onClick={() =>
                      router.push(
                        `/admin/excursions/${excursion.id}`
                      )
                    }
                    className="cursor-pointer border-t border-[var(--rule)] transition hover:bg-[var(--paper-l)]/70"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--ink)]">
                        {excursion.title}
                      </div>

                      <div className="mt-1 max-w-sm truncate text-sm text-[var(--ink)]/50">
                        {excursion.subtitle || "Без підзаголовка"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-[var(--ink)]/55">
                      {excursion.slug}
                    </td>

                    <td className="px-5 py-4 text-sm text-[var(--ink)]/70">
                      {excursion.duration} хв
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          excursion.status === "published"
                            ? "bg-green-500/10 text-green-700"
                            : "bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {statusLabel(excursion.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        {/* Редагувати */}
                        <button
                          type="button"
                          title="Редагувати"
                          onClick={(event) => {
                            event.stopPropagation();

                            router.push(
                              `/admin/excursions/${excursion.id}`
                            );
                          }}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--rule)] text-[var(--ink)]/65 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          <Pencil size={16} />
                        </button>

                        {/* Видалити */}
                        <button
                          type="button"
                          title="Видалити"
                          disabled={deletingId === excursion.id}
                          onClick={(event) =>
                            handleDelete(
                              event,
                              excursion.id,
                              excursion.title
                            )
                          }
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                        >
                          <Trash2 size={16} />

                          {deletingId === excursion.id
                            ? "..."
                            : "Видалити"}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Пагінація */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">

        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--rule)] px-3 py-2 text-sm transition hover:bg-[var(--paper-r)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowLeft size={15} />
          Назад
        </button>

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        ).map((number) => (
          <button
            type="button"
            key={number}
            onClick={() => goToPage(number)}
            className={`h-9 min-w-9 rounded-lg border px-3 text-sm transition ${
              number === page
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--rule)] hover:bg-[var(--paper-r)]"
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--rule)] px-3 py-2 text-sm transition hover:bg-[var(--paper-r)] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Далі
          <ArrowRight size={15} />
        </button>

      </div>
    </div>
  );
}
