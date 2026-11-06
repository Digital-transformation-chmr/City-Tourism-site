
import prisma from "@/app/lib/prisma";
import ExcursionTableClient from "./excursion-table-client";

const PAGE_SIZE = 20;

export default async function TableExcPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;

  const requestedPage = Number(params.page || 1);
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const total = await prisma.excursion.count();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const excursions = await prisma.excursion.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      title: true,
      subtitle: true,
      slug: true,
      duration: true,
      status: true,
    },
  });

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            Admin panel
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--ink)]">
            Екскурсії
          </h1>

          <p className="mt-2 text-sm text-[var(--ink)]/55">
            Перегляд, створення, редагування та видалення маршрутів
          </p>
        </div>

        <a
          href="/admin/excursions"
          className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          + Створити екскурсію
        </a>
      </div>

      <ExcursionTableClient
        excursions={excursions}
        page={safePage}
        totalPages={totalPages}
        total={total}
      />
    </div>
  );
}
