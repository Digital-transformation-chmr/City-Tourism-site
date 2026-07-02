'use client'

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Phone, Globe, Utensils, Sandwich, Tag } from "lucide-react";

export interface Place {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  images: string[];
  yearBuilt?: number;
  status?: string;
  type: string;
  visiting?: string;
  address?: string;
  lat?: number;
  lng?: number;
  openingHours?: string;
  phone?: string | any;
  website?: string | any;
  tags: string[];
}

type CategoryKey = "Ресторани" | "Кафе";

const CATEGORIES: { key: CategoryKey; icon: React.ReactNode; chapter: string; match: string }[] = [
  { key: "Ресторани", icon: <Utensils size={11} />, chapter: "Розділ I", match: "Ресторан" },
  { key: "Кафе",      icon: <Sandwich size={11} />, chapter: "Розділ II", match: "Кафе" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Attraction() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("Ресторани");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  const [pageFlipKey, setPageFlipKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/places");
      const data = await res.json();
      setPlaces(data);
    };
    load();
  }, []);

  const searched = useMemo(() => {
    if (!search.trim()) return places;
    return places.filter((p) =>
      p.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [places, search]);

  const filtered = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.key === activeCategory)!;
    return searched.filter((p) => p.type?.includes(cat.match));
  }, [searched, activeCategory]);

  const selected: Place | null =
    filtered.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  const chapterInfo = CATEGORIES.find((c) => c.key === activeCategory)!;
  const selectedIndex = selected ? filtered.findIndex((p) => p.id === selected.id) : -1;

  function switchCategory(key: CategoryKey) {
    const ci = CATEGORIES.findIndex((c) => c.key === activeCategory);
    const ni = CATEGORIES.findIndex((c) => c.key === key);
    setDir(ni > ci ? 1 : -1);
    setActiveCategory(key);
    setSelectedId(null);
    setPageFlipKey((k) => k + 1);
  }

  function selectPlace(id: string) {
    setSelectedId(id);
    setPageFlipKey((k) => k + 1);
  }

  return (
    <div
      className="h-screen pt-12 w-full overflow-hidden flex flex-col bg-[#e8e2d4]"
      style={{ fontFamily: "'Lora', serif" }}
    >
      {/* ── Running header / title bar ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-10 py-3 border-b border-[var(--rule)] bg-[var(--paper-l)] gap-6">
        <div className="flex items-center gap-6 flex-shrink-0">
          <span
            className="text-[11px] uppercase text-[var(--muted)]"
            style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.25em" }}
          >
            Черкаси
          </span>
          <span className="text-[var(--rule)]">·</span>
          <span
            className="text-[12px] italic text-[var(--muted)]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Гастрономічний путівник
          </span>
        </div>

        {/* 🔎 SEARCH */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук по назві…"
          className="flex-1 max-w-xs px-3 py-1.5 outline-none text-[12px] text-[var(--ink)] bg-[var(--paper-r)] border border-[var(--rule)]"
          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
        />

        {/* Category tabs */}
        <div className="flex items-center gap-0 flex-shrink-0">
          {CATEGORIES.map((cat) => {
            const active = cat.key === activeCategory;
            return (
              <button
                key={cat.key}
                onClick={() => switchCategory(cat.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2 cursor-pointer transition-colors duration-200 text-[12px] uppercase bg-none border-none border-b-2 ${
                  active
                    ? "text-[var(--accent)] border-b-[var(--accent)]"
                    : "text-[var(--muted)] border-b-transparent"
                }`}
                style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.12em" }}
              >
                {cat.icon}
                {cat.key}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Book spread ── */}
      <div className="flex flex-1 overflow-hidden bg-[#d4ccbc]">

        {/* LEFT PAGE */}
        <div
          className="flex flex-col overflow-hidden bg-[var(--paper-l)] border-r border-[var(--rule)]"
          style={{ width: 300, boxShadow: "2px 0 12px rgba(0,0,0,0.08)" }}
        >
          <div className="px-8 pt-8 pb-6 flex-shrink-0 border-b border-[var(--rule)]">
            <p
              className="text-[10px] uppercase text-[var(--muted)]"
              style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.3em" }}
            >
              {chapterInfo.chapter}
            </p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={activeCategory}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease }}
                className="text-[22px] font-bold text-[var(--ink)] mt-1 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {activeCategory}
              </motion.h2>
            </AnimatePresence>
            <div className="w-7 h-px bg-[var(--accent)] mt-2.5" />
          </div>

          {/* Place list */}
          <div className="flex-1 overflow-y-auto py-4" style={{ scrollbarWidth: "none" }}>
            {filtered.length === 0 && (
              <p
                className="px-8 py-4 text-[12px] italic text-[var(--muted)]"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                Нічого не знайдено
              </p>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory + search}
                initial={{ opacity: 0, x: dir * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -10 }}
                transition={{ duration: 0.35, ease }}
              >
                {filtered.map((place, i) => {
                  const isActive = selected && place.id === selected.id;
                  return (
                    <motion.button
                      key={place.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.045, ease }}
                      onClick={() => selectPlace(place.id)}
                      className="w-full text-left cursor-pointer bg-none border-none p-0"
                    >
                      <div
                        className={`flex items-start gap-3 px-8 py-3 transition-colors duration-200 border-l-[3px] ${
                          isActive
                            ? "bg-[var(--accent)]/[0.07] border-l-[var(--accent)]"
                            : "border-l-transparent"
                        }`}
                      >
                        <span
                          className="text-[11px] text-[var(--muted)] pt-[3px] min-w-[16px] text-right"
                          style={{ fontFamily: "'EB Garamond', serif" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] leading-tight ${
                              isActive ? "font-bold text-[var(--ink)]" : "font-normal text-[var(--muted)]"
                            }`}
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {place.title}
                          </p>
                          {place.subtitle && (
                            <p
                              className="text-[11px] italic text-[var(--muted)] mt-0.5"
                              style={{ fontFamily: "'EB Garamond', serif" }}
                            >
                              {place.subtitle}
                            </p>
                          )}
                        </div>
                        {place.status && (
                          <span
                            className="flex-shrink-0 text-[9px] uppercase text-[var(--accent)] border border-[var(--accent)]/[0.27] px-1.5 py-0.5 mt-0.5"
                            style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.08em" }}
                          >
                            {place.status}
                          </span>
                        )}
                      </div>

                      {i < filtered.length - 1 && (
                        <div className="mx-2 border-b border-dotted border-[var(--rule)]" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-shrink-0 px-8 py-4 flex items-center justify-between border-t border-[var(--rule)]">
            <span
              className="text-[10px] italic text-[var(--muted)]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Де поїсти
            </span>
            <span
              className="text-[10px] text-[var(--muted)]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {filtered.length}
            </span>
          </div>
        </div>

        {/* SPINE shadow */}
        <div
          className="w-1.5 flex-shrink-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.14), rgba(0,0,0,0.04))" }}
        />

        {/* RIGHT PAGE */}
        <div className="flex-1 overflow-hidden" style={{ perspective: "1600px" }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <>
                <motion.div
                  key={pageFlipKey}
                  className="h-full flex flex-col overflow-hidden bg-[var(--paper-r)]"
                  style={{ transformOrigin: "left center", boxShadow: "-2px 0 8px rgba(0,0,0,0.04)" }}
                  initial={{ rotateY: 40, opacity: 0, filter: "brightness(0.85)" }}
                  animate={{ rotateY: 0, opacity: 1, filter: "brightness(1)" }}
                  exit={{ rotateY: -25, opacity: 0, filter: "brightness(0.9)" }}
                  transition={{ duration: 0.5, ease }}
                >
                <div className="flex flex-1 overflow-hidden">

                  {/* Image column */}
                  <div className="flex flex-col overflow-hidden border-r border-[var(--rule)]" style={{ width: "42%", flexShrink: 0 }}>
                    <div className="flex-shrink-0 px-7 py-3 flex items-center justify-between border-b border-[var(--rule)]">
                      <span
                        className="text-[10px] uppercase italic text-[var(--muted)]"
                        style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.22em" }}
                      >
                        {activeCategory}
                      </span>
                      <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>✦</span>
                    </div>

                    {selected.images?.[0] && (
                      <div className="flex-1 flex flex-col px-7 pt-6 pb-4 overflow-hidden">
                        <div className="flex-1 overflow-hidden relative border border-[var(--rule)]" style={{ minHeight: 0 }}>
                          <img src={selected.images[0]} alt={selected.title} className="w-full h-full object-cover" />
                          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 30px rgba(0,0,0,0.18)" }} />
                        </div>
                        <p
                          className="mt-2 text-center text-[10px] italic text-[var(--muted)]"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
                        >
                          {selected.title}{selected.subtitle ? ` — ${selected.subtitle}` : ""}
                        </p>
                      </div>
                    )}

                    <div className="px-7 pb-5 flex flex-col gap-2 border-t border-[var(--rule)] pt-3.5">
                      {selected.address && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <MapPin size={10} className="flex-shrink-0" />
                          <span className="text-[11px]" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.address}</span>
                        </div>
                      )}
                      {selected.openingHours && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Clock size={10} className="flex-shrink-0" />
                          <span className="text-[11px]" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.openingHours}</span>
                        </div>
                      )}
                      {selected.phone && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Phone size={10} className="flex-shrink-0" />
                          <span className="text-[11px]" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.phone}</span>
                        </div>
                      )}
                      {selected.website && (
                        <a
                          href={selected.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[var(--accent)] no-underline"
                        >
                          <Globe size={10} className="flex-shrink-0" />
                          <span className="text-[11px]" style={{ fontFamily: "'EB Garamond', serif" }}>Сайт закладу</span>
                        </a>
                      )}
                      {(selected.yearBuilt || selected.visiting) && (
                        <div className="flex items-center justify-between mt-1">
                          {selected.yearBuilt && (
                            <span className="text-[11px] text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>
                              Засновано {selected.yearBuilt}
                            </span>
                          )}
                          {selected.visiting && (
                            <span className="text-[12px] text-[var(--muted)]" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {selected.visiting}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text column */}
                  <div className="flex-1 flex flex-col overflow-hidden px-10 py-8">
                    <div className="flex-shrink-0 flex items-center justify-between mb-6 pb-3 border-b border-[var(--rule)]">
                      <span
                        className="text-[10px] uppercase text-[var(--muted)]"
                        style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.22em" }}
                      >
                        Гастрономічний путівник · Черкаси
                      </span>
                      <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>
                        {String(selectedIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                      </span>
                    </div>

                    <h1
                      className="font-bold text-[var(--ink)] leading-[1.15] mb-2"
                      style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)" }}
                    >
                      {selected.title}
                    </h1>
                    {selected.subtitle && (
                      <p
                        className="text-[13px] italic text-[var(--muted)] mb-1"
                        style={{ fontFamily: "'EB Garamond', serif" }}
                      >
                        {selected.subtitle}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mb-5 mt-3">
                      <div className="flex-1 h-px bg-[var(--rule)]" />
                      <span className="text-[12px] text-[var(--accent)]">❧</span>
                      <div className="flex-1 h-px bg-[var(--rule)]" />
                    </div>

                    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                      {selected.description && (
                        <p
                          className="text-[15px] leading-[1.85] text-[var(--ink)] text-justify"
                          style={{ fontFamily: "'Lora', serif" }}
                        >
                          <span
                            className="font-bold text-[var(--accent)] float-left mr-1.5 mt-1.5"
                            style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.8em", lineHeight: 0.78 }}
                          >
                            {selected.description[0]}
                          </span>
                          {selected.description.slice(1)}
                        </p>
                      )}

                      {/* Tags */}
                      {selected.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {selected.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 text-[11px] text-[var(--muted)] border border-[var(--rule)] px-2.5 py-[3px]"
                              style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
                            >
                              <Tag size={9} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-8">
                        <button
                          className="cursor-pointer transition-colors duration-200 text-[11px] uppercase text-[var(--paper-r)] bg-[var(--accent)] border-none px-5.5 py-2.5"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.22em" }}
                        >
                          Прокласти маршрут
                        </button>
                        <button
                          className="cursor-pointer transition-colors duration-200 text-[11px] uppercase text-[var(--accent)] bg-transparent border border-[var(--rule)] px-5.5 py-2.5"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.22em" }}
                        >
                          Зберегти
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center justify-between px-10 py-4 border-t border-[var(--rule)]">
                  <span
                    className="text-[10px] italic text-[var(--muted)]"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    {selected.title}
                  </span>
                  {selected.type && (
                    <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>
                      {selected.type}
                    </span>
                  )}
                </div>
              </motion.div>
            </>
            ) : (
              <div className="h-full flex items-center justify-center bg-[var(--paper-r)]">
                <p
                  className="text-[13px] italic text-[var(--muted)]"
                  style={{ fontFamily: "'EB Garamond', serif" }}
                >
                  Нічого не знайдено за твоїм запитом
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}