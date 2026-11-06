'use client';

import { useState, useEffect, useMemo } from "react";
import PlacePolaroidGrid, { PolaroidPagination } from "@/app/components/Places/placePolaroidCard";
import { Place } from "../../components/Places/placeCard";
import CameraHero from "./Camerahero";

export default function Attraction() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 9;

  useEffect(() => {
    const load = async () => {
      const params = new URLSearchParams();
      params.append("exclude", "Готель,Кафе,Ресторан");

      if (search.trim()) {
        params.append("search", search);
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();

      setPlaces(data);
      setPage(1);
    };

    load();
  }, [search]);

  const totalPages = Math.ceil(places.length / PAGE_SIZE);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return places.slice(start, start + PAGE_SIZE);
  }, [places, page]);

  return (
    <div className="min-h-screen relative pt-10 md:pt-0">
      <CameraHero places={places} />

      {/* HERO & SEARCH */}
      <div className="relative overflow-hidden bg-black/10 " id="Pin-1">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)]" />

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

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по назві або тегу..."
            className="mt-6 w-full max-w-md px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
          />
        </div>
      </div>

      <div className="mx-auto px-10 py-12">
        <PlacePolaroidGrid Places={paginated} />

        <PolaroidPagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}