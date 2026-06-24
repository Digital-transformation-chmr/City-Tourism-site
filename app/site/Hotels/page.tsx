'use client'

import { useEffect, useMemo, useState } from "react";
import PopPlaceGrid from "../../components/Places/placeCard";
import { Place } from "../../components/Places/placeCard";

export default function Attraction() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");

  // 📡 load hotels
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/places");
      const data = await res.json();

      // 🏨 тільки готелі
      const hotels = data.filter((p: Place) =>
        p.type.includes("Готель")
      );

      setPlaces(hotels);
    };

    load();
  }, []);

  // 🔎 search by title
  const filtered = useMemo(() => {
    if (!search.trim()) return places;

    return places.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [places, search]);

  return (
    <div className="min-h-screen">

      {/* HERO */}
      <div className="relative overflow-hidden bg-black/10">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-80" />

        <div className="py-20 px-12 flex flex-col items-start">

          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-light)] leading-tight max-w-xl">
            <span className="italic text-[var(--accent)]">
              Готелі
            </span>
          </h1>

          <p className="mt-4 text-[var(--gray-text)] text-base max-w-md leading-relaxed">
            Місце де можна відпочити та зупинитися на нічліг
          </p>

          {/* 🔎 SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук готелю..."
            className="mt-6 w-full max-w-md px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
          />
        </div>
      </div>

      {/* GRID */}
      <div className="mx-2 px-6 sm:px-10 py-8">

        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <p className="text-[var(--gray-text)] text-sm tracking-wide uppercase">
            Готелі: {filtered.length}
          </p>
        </div>

        <PopPlaceGrid Places={filtered} />
      </div>

    </div>
  );
}