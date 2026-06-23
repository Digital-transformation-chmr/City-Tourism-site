'use client'

import { useEffect, useMemo, useState } from "react";
import PopPlaceGrid from "../../components/Places/placeCard";
import { Place } from "../../components/Places/placeCard";

export default function Attraction() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 9;

  // 🔥 отримання з API (з фільтром по тегах/назві)
  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search);
      }

      // якщо хочеш — сюди можна додати selectedTags
      // params.append("tags", "парк,музей");

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();

      setPlaces(data);
      setPage(1); // reset page при нових даних
    };

    load();
  }, [search]);

  // 📄 пагінація (тільки локально)
  const totalPages = Math.ceil(places.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return places.slice(start, start + PAGE_SIZE);
  }, [places, page]);

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <div className="relative overflow-hidden bg-black/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-80" />

        <div className="py-20 px-12 flex flex-col items-start">
          <span className="text-sm tracking-[0.25em] uppercase font-bold text-[var(--accent)] flex items-center gap-3 mb-4">
            <span className="inline-block w-8 h-px bg-[var(--accent)]" />
            Каталог
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-light)] leading-tight max-w-xl">
            Пам'ятки <span className="italic text-[var(--accent)]">міста</span>
          </h1>

          <p className="mt-4 text-[var(--gray-text)] text-base max-w-md">
            Відкрийте унікальні місця
          </p>

          {/* 🔎 SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по назві або тегу..."
            className="mt-6 w-full max-w-md px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="mx-2 px-6 sm:px-10 py-8">

        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <p className="text-[var(--gray-text)] text-sm uppercase">
            Результати: {places.length}
          </p>
        </div>

        <PopPlaceGrid Places={paginated} />

        {/* 📄 PAGINATION */}
        <div className="flex gap-2 justify-center mt-10 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border border-white/20 rounded"
          >
            ←
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1
                  ? "bg-[var(--accent)] text-black"
                  : "border-white/20"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1 border border-white/20 rounded"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}