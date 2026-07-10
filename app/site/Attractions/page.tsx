'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, ChevronLeft, ChevronRight, Info, Globe } from "lucide-react";
import PopPlaceGrid from "../../components/Places/placeCard";
import { Place } from "../../components/Places/placeCard";

const SIDEBAR_WIDTH_DESKTOP = "clamp(260px, 22vw, 340px)";

const KEYFRAMES = `
  @keyframes mini-white {
    0%   { opacity: 0.9; }
    100% { opacity: 0; }
  }
  @keyframes mini-burst {
    0%   { transform: scale(0.04); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
  }
`;

function getImages(place: Place): string[] {
  if (!place) return [];
  if (Array.isArray(place.images) && place.images.length) return place.images;
  return [];
}

function DiamondSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" fill="white" style={{ position: "absolute", ...style }}>
      <path d="M 50,1 Q 50,50 99,50 Q 50,50 50,99 Q 50,50 1,50 Q 50,50 50,1 Z" />
    </svg>
  );
}

function MiniFlash() {
  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-white" style={{ animation: "mini-white 0.5s ease-out forwards" }} />
      <DiamondSVG style={{
        width: "30vmin", height: "30vmin",
        top: "50%", left: "50%", marginTop: "-15vmin", marginLeft: "-15vmin",
        animation: "mini-burst 0.5s ease-out forwards",
        filter: "drop-shadow(0 0 20px white)",
        zIndex: 1,
      }} />
    </div>
  );
}

function CanonCamera({ imageUrl, onPrev, onNext }: { imageUrl?: string; onPrev: () => void; onNext: () => void }) {
  return (
    <div className="relative flex flex-col items-center w-full" style={{ maxWidth: "min(900px, 100%)" }}>
      {/* КОРПУС КАМЕРИ (Задня панель) */}
      <div
        className="relative select-none w-full aspect-[3/2] bg-[#1a1a1a] rounded-[24px] p-2 sm:p-6 flex items-center justify-between border-b-8 border-black/40"
        style={{ 
          boxShadow: "inset 0 4px 10px rgba(255,255,255,0.1), 0 30px 60px rgba(0,0,0,0.5)",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "4px 4px"
        }}
      >
        {/* Верхній видошукач (Окуляр над екраном) */}
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-[28%] h-[16px] bg-[#121212] border border-black rounded-t-lg shadow-md z-0 flex items-center justify-center">
          <div className="w-[85%] h-[4px] bg-red-600/30 rounded-full blur-[1px]" />
        </div>

        {/* ================= ЗАДНІЙ ЕКРАН КАМЕРИ ================= */}
        <div className="relative flex-1 h-full bg-black rounded-lg overflow-hidden border-[6px] border-[#121212] shadow-inner group">
          
          {/* Зображення пам'ятки */}
          <AnimatePresence mode="wait">
            {imageUrl && (
              <motion.img
                key={imageUrl}
                src={imageUrl}
                alt="Live View"
                className="w-full h-full object-cover absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </AnimatePresence>

          {/* Екранний фільтр (легкий шум та віньєтка для реалізму) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none z-10" />

          {/* ================= CAMERA HUD (ІНТЕРФЕЙС ДИСПЛЕЯ) ================= */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between text-white font-mono text-[10px] sm:text-xs z-20 pointer-events-none select-none tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            
            {/* Верхній ряд HUD */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                <span className="font-bold text-red-500">LIVE</span>
              </div>
              <div className="bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                1080p 60fps
              </div>
              {/* Іконка батареї */}
              <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                <span>94%</span>
                <div className="w-5 h-2.5 border border-white p-0.5 flex rounded-sm">
                  <div className="h-full w-full bg-emerald-500 rounded-2xs" />
                </div>
              </div>
            </div>

            {/* Сітка третин (Rule of Thirds) — ледь помітна */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
            </div>

            {/* Рамка фокусування по центру */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-24 sm:h-24 border border-white/40 flex items-center justify-center">
              <div className="w-2 h-2 border border-emerald-400 bg-emerald-400/20 rounded-full" />
              {/* Куточки фокусу */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
            </div>

            {/* Нижній ряд HUD: Параметри експозиції */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 w-full text-amber-400 font-bold bg-black/50 py-1 px-3 rounded-md max-w-max mx-auto backdrop-blur-sm">
              <span>1/125</span>
              <span>F1.4</span>
              <span className="text-white/60">MM. <span className="text-emerald-400">0.0</span></span>
              <span className="bg-amber-500 text-black px-1 rounded text-[9px]">ISO 400</span>
              <span className="text-white text-[9px] font-sans">AWB</span>
            </div>
          </div>
        </div>

        {/* ================= ФІЗИЧНІ КНОПКИ ПРАВОРУЧ ЕКРАНА ================= */}
        <div className="w-[60px] sm:w-[80px] h-full flex flex-col justify-between items-center pl-3 sm:pl-4 py-2 z-10 border-l border-white/5">
          
          {/* Диск режимів або верхня кнопка */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 bg-[#262626] border border-black rounded-full shadow flex items-center justify-center text-[8px] text-white/40 font-bold">
              MENU
            </div>
          </div>

          {/* Джойстик навігації (Кнопки назад/вперед в стилі клікера камери) */}
          <div className="flex flex-col gap-3 my-auto items-center">
            {/* Кнопка ВЛІВО (Попередній слайд) */}
            <button
              onClick={onPrev}
              className="w-10 h-10 bg-[#222] hover:bg-[#2a2a2a] active:bg-[#151515] text-white/80 hover:text-white rounded-full flex items-center justify-center border border-black transition-all shadow-md group/btn"
              style={{ boxShadow: "inset 0 1px 3px rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.3)" }}
            >
              <ChevronLeft size={20} className="transition-transform group-hover/btn:-translate-x-0.5" />
            </button>

            {/* Кнопка ВПРАВО (Наступний слайд) */}
            <button
              onClick={onNext}
              className="w-10 h-10 bg-[#222] hover:bg-[#2a2a2a] active:bg-[#151515] text-white/80 hover:text-white rounded-full flex items-center justify-center border border-black transition-all shadow-md group/btn"
              style={{ boxShadow: "inset 0 1px 3px rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.3)" }}
            >
              <ChevronRight size={20} className="transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>

          {/* Кнопка перегляду галереї (Просто декор для автентичності) */}
          <div className="w-7 h-5 bg-[#262626] border border-black rounded flex items-center justify-center">
            <div className="w-3 h-2.5 border border-white/30 rounded-xs" />
          </div>
        </div>

      </div>
    </div>
  );
}

// ── LEFT SIDEBAR: Оновлено під поля title та yearBuilt ──
function LeftSidebar({ place, visible, current, total, isMobile }: { place: Place; visible: boolean; current: number; total: number; isMobile: boolean }) {
  return (
    <motion.div
      animate={isMobile ? { y: visible ? 0 : 20, opacity: visible ? 1 : 0 } : { x: visible ? 0 : "-115%", opacity: 1 }}
      initial={isMobile ? { y: 20, opacity: 0 } : { x: "-115%" }}
      transition={{ type: "spring", damping: 26, stiffness: 180 }}
      className={isMobile ? "w-full" : "absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-center"}
      style={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH_DESKTOP,
        padding: isMobile ? "24px 20px" : "0 clamp(24px, 2.5vw, 36px)",
        background: "rgba(255, 255, 255, 0.08)",
        borderRight: !isMobile ? "1px solid rgba(0, 0, 0, 0.05)" : undefined,
        border: isMobile ? "1px solid rgba(255, 255, 255, 0.2)" : undefined,
        borderRadius: isMobile ? "20px" : "0",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#0052cc] text-xs sm:text-sm font-bold tracking-widest uppercase">
            {place?.type ?? "Пам'ятка"}
          </span>
          <span className="text-slate-500 text-lg font-semibold" style={{ fontFamily: "'Space Mono', monospace" }}>
            {String(current + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>

        <h1 className="text-slate-900 leading-tight font-bold text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
          {place?.title ?? "—"}
        </h1>

        {place?.yearBuilt && (
          <div>
            <div className="text-slate-500/80 text-xs tracking-wider uppercase font-bold mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>
              Рік спорудження
            </div>
            <div className="text-[#c8102e] text-lg sm:text-xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
              {place.yearBuilt}
            </div>
          </div>
        )}

        <div className="h-px w-full bg-gradient-to-r from-slate-300/50 to-transparent" />

        <p className="text-slate-800 leading-relaxed text-sm sm:text-base font-medium">
          {place?.description ?? ""}
        </p>

        {place?.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {place.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-xs font-bold tracking-wide uppercase text-[#0052cc] bg-blue-50/60 border border-blue-200/60 rounded-md"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{ width: i === current ? 24 : 6, height: 6, background: i === current ? "#0052cc" : "rgba(148,163,184,0.4)" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── RIGHT SIDEBAR: Оновлено під openingHours, status та website ──
function RightSidebar({ place, visible, onNext, isMobile }: { place: Place; visible: boolean; onNext: () => void; isMobile: boolean }) {
  return (
    <motion.div
      animate={isMobile ? { y: visible ? 0 : 20, opacity: visible ? 1 : 0 } : { x: visible ? 0 : "115%", opacity: 1 }}
      initial={isMobile ? { y: 20, opacity: 0 } : { x: "115%" }}
      transition={{ type: "spring", damping: 26, stiffness: 180 }}
      className={isMobile ? "w-full" : "absolute right-0 top-0 bottom-0 z-20 flex flex-col justify-center"}
      style={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH_DESKTOP,
        padding: isMobile ? "24px 20px" : "0 clamp(24px, 2.5vw, 36px)",
        background: "rgba(255, 255, 255, 0.08)",
        borderLeft: !isMobile ? "1px solid rgba(0, 0, 0, 0.05)" : undefined,
        border: isMobile ? "1px solid rgba(255, 255, 255, 0.2)" : undefined,
        borderRadius: isMobile ? "20px" : "0",
        backdropFilter: "blur(20px)",
      }}
    >
      
      <div className="flex flex-col gap-6">
        <div className="text-slate-500/80 text-xs tracking-wider uppercase font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
          Деталі
        </div>

        <div className="flex flex-col gap-5">
          {place?.address && (
            <div className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 mt-0.5 text-[#c8102e]" />
              <div>
                <div className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Адреса
                </div>
                <div className="text-slate-900 text-sm sm:text-base font-semibold leading-snug">
                  {place.address}
                </div>
              </div>
            </div>
          )}

          {place?.openingHours && (
            <div className="flex items-start gap-3">
              <Clock size={18} className="shrink-0 mt-0.5 text-[#0052cc]" />
              <div>
                <div className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Графік
                </div>
                <div className="text-slate-900 text-sm sm:text-base font-semibold">
                  {place.openingHours}
                </div>
              </div>
            </div>
          )}

          {place?.status && (
            <div className="flex items-start gap-3">
              <Info size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <div className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Статус
                </div>
                <div className="text-slate-900 text-sm sm:text-base font-semibold">
                  {place.status}
                </div>
              </div>
            </div>
          )}

          {place?.website && (
            <div className="flex items-start gap-3">
              <Globe size={18} className="shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <div className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Вебсайт
                </div>
                <a 
                  href={place.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base font-semibold break-all"
                >
                  {place.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="h-px w-full bg-gradient-to-l from-slate-300/50 to-transparent" />

        <a
          href={"/site/PlacePage/" + place.id}
          className="w-full text-center py-3.5 transition-all duration-200 bg-white/40 hover:bg-[#c8102e] text-[#c8102e] hover:text-white active:scale-[0.98] rounded-xl font-bold border border-[#c8102e]/30 hover:border-transparent text-sm shadow-sm"
          style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em" }}
        >
          Дізнатись Більше →
        </a>
      </div>
    </motion.div>
  );
}

// ── HERO ──
function CameraHero({ places }: { places: Place[] }) {
  const [current, setCurrent] = useState(0);
  const [miniFlash, setMiniFlash] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrent(0);
  }, [places]);

  useEffect(() => {
    setSidebarVisible(true);
  }, []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!places.length) return;
      setSidebarVisible(false);
      setMiniFlash(true);
      setFlashKey((k) => k + 1);
      setTimeout(() => {
        setCurrent((p) => (p + dir + places.length) % places.length);
        setMiniFlash(false);
        setTimeout(() => setSidebarVisible(true), 80);
      }, 500);
    },
    [places.length]
  );

  const place = places[current];
  const imageUrl = useMemo(() => getImages(place)[0], [place]);

  return (
    <section
      className="relative min-h-screen md:h-screen w-full overflow-hidden flex flex-col justify-center items-center bg-slate-100"
      style={{
        paddingLeft: isMobile ? "16px" : SIDEBAR_WIDTH_DESKTOP,
        paddingRight: isMobile ? "16px" : SIDEBAR_WIDTH_DESKTOP,
        paddingTop: isMobile ? "40px" : "0px",
        paddingBottom: isMobile ? "40px" : "0px",
      }}
    >
      <style>{KEYFRAMES}</style>

      {imageUrl ? (
        <div
          className="absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(30px) brightness(0.94) saturate(1.1)",
            transform: "scale(1.06)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-200" />
      )}
      
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.2) 20%, rgba(241,245,249,0.75) 100%)" }} />

      {miniFlash && <MiniFlash key={flashKey} />}

      <div className="relative z-10 w-full flex justify-center items-center my-auto px-2">
        <CanonCamera imageUrl={imageUrl} onPrev={() => navigate(-1)} onNext={() => navigate(1)} />
      </div>

      {place && (
        <>
          {isMobile ? (
            <div className="w-full max-w-[500px]  z-10 flex flex-col gap-5 mt-8">
              <LeftSidebar place={place} visible={sidebarVisible} current={current} total={places.length} isMobile={true} />
              <RightSidebar place={place} visible={sidebarVisible} onNext={() => navigate(1)} isMobile={true} />
            </div>
          ) : (
            <>
              <LeftSidebar place={place} visible={sidebarVisible} current={current} total={places.length} isMobile={false} />
              <RightSidebar place={place} visible={sidebarVisible} onNext={() => navigate(1)} isMobile={false} />
            </>
          )}
        </>
      )}

      {/* ================= СТРІЛКА «ДІЗНАТИСЬ БІЛЬШЕ» ЗНИЗУ ================= */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.45, y: 0 }} // Робимо напівпрозорим (ледь помітним)
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute  bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white font-medium text-xs tracking-wider select-none pointer-events-none uppercase"
      >
        <span>Більше</span>
        
        {/* Анімована стрілочка, що рухається вгору-вниз */}
        <motion.svg 
          animate={{ y: [0, 6, 0] }} 
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "easeInOut" 
          }}
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </motion.svg>
      </motion.div>

    </section>
  );
}

// ── ROOT ──
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
    <div className="min-h-screen relative bg-slate-50">
      <CameraHero places={places} />

      {/* HERO & SEARCH */}
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

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук по назві або тегу..."
            className="mt-6 w-full max-w-md px-4 py-2 bg-black/30 border border-white/10 rounded text-white"
          />
        </div>
      </div>

      <div className="mx-auto px-10 py-12">
        <PopPlaceGrid Places={paginated} />

        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-12 flex-wrap">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 bg-white hover:bg-slate-50 font-semibold shadow-sm">←</button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-4 py-2 border rounded-xl font-bold transition-all shadow-sm ${page === i + 1 ? "bg-[#0052cc] text-white border-[#0052cc]" : "border-slate-300 text-slate-700 bg-white hover:bg-slate-50"}`}
              >
                {i + 1}
              </button>
            ))}

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 bg-white hover:bg-slate-50 font-semibold shadow-sm">→</button>
          </div>
        )}
      </div>
    </div>
  );
}