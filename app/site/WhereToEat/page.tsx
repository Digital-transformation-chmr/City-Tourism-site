'use client'

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Clock, Phone, Globe, Utensils, Sandwich, Tag } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import SplitText from "@/components/SplitText";


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

const CATEGORIES: {
  key: CategoryKey;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  chapter: string;
  match: string;
}[] = [
  { key: "Ресторани", icon: Utensils, chapter: "Розділ I", match: "Ресторан" },
  { key: "Кафе", icon: Sandwich, chapter: "Розділ II", match: "Кафе" },
];

// наскільки закладка "пірнає" вниз при кліку (px)
const DIP_EXTRA = 12;
// глибина трикутного вирізу знизу закладки (px)
const NOTCH = 15;
// наскільки закладка фізично довша й виступає вище за верхній край
// смужки — так вона виглядає прикріпленою до краю, а не підвішеною
// окремо в повітрі
const PROTRUDE = 800;

const ease = [0.22, 1, 0.36, 1] as const;

export default function Attraction() {
    useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])
  const [places, setPlaces] = useState<Place[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("Ресторани");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dir, setDir] = useState(1);
  const [pageFlipKey, setPageFlipKey] = useState(0);

  // рефи закладок-категорій + прапорець, що анімація кліку вже триває
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isAnimating = useRef(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/places");
      const data = await res.json();
      setPlaces(data);
    };
    load();
  }, []);

  // закладки "випадають" згори один раз при заході на сторінку
  useEffect(() => {
    const tabs = tabRefs.current.filter(Boolean) as HTMLButtonElement[];
    if (!tabs.length) return;
    gsap.fromTo(
      tabs,
      { y: -24 },
      { y: 0, duration: 0.6, ease: "back.out(1.7)", stagger: 0.1 }
    );
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

  // клік по закладці-категорії: пірнає вниз, пружно піднімається,
  // і лише потім перемикає категорію
  function handleCategoryClick(
    e: React.MouseEvent<HTMLButtonElement>,
    key: CategoryKey
  ) {
    if (key === activeCategory || isAnimating.current) return;
    const target = e.currentTarget;
    isAnimating.current = true;

    gsap
      .timeline({
        onComplete: () => {
          isAnimating.current = false;
          switchCategory(key);
        },
      })
      .to(target, {
        y: DIP_EXTRA,
        scaleY: 1.05,
        duration: 0.18,
        ease: "power2.in",
      })
      .to(target, {
        y: 0,
        scaleY: 1,
        duration: 0.2,
        ease: "elastic.out(1, 0.55)",
      });
  }

  function selectPlace(id: string) {
    setSelectedId(id);
    setPageFlipKey((k) => k + 1);
  }

  return (
    <div
      className="min-h-screen md:h-screen w-full pt-12 flex flex-col bg-[#e8e2d4]"
      style={{ fontFamily: "'Lora', serif" }}
    >
      {/* ── Running header / title bar ── */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-10 py-3 border-b border-[var(--rule)] bg-[var(--paper-l)]">
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 order-1">
          <span
            className="text-3xl uppercase text-[var(--muted)]"
            style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.2em" }}
          >
            Черкаси
          </span>
          <span className="hidden sm:inline text-[var(--rule)]">·</span>
          <span
            className="hidden sm:inline text-[20px] italic text-[var(--muted)]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Гастрономічний путівник
          </span>
        </div>

       {/* Category bookmarks — self-start так вони прикріплені до
    верхнього краю смужки, а не центровані батьківським рядом */}
          <div className="relative flex items-start gap-2 flex-shrink-0 order-2 sm:order-3 ml-auto sm:ml-0 self-start z-[99]">
            {CATEGORIES.map((cat, i) => {
              const active = cat.key === activeCategory;
              const Icon = cat.icon;
              
              return (
                <motion.button
                  key={cat.key}
                  // 1. Налаштування фізики перетягування (Drag)
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }} // Повертається в нульову точку
                  dragElastic={{ top: 0, bottom: 0.6 }}   // Наскільки легко тягнеться вниз (0.6 — пружна гумка)
                  dragMomentum={false}                    // Вимикаємо інерцію, щоб працювала суто пружина
                  
                  // Повернення на місце після того, як відпустили
                  onDragEnd={(event, info) => {
                    // Якщо потягнули достатньо сильно вниз (наприклад, більше 25px) — перемикаємо категорію
                    if (info.offset.y > 25 && !active && !isAnimating.current) {
                      switchCategory(cat.key);
                    }
                  }}

                  // 2. Ефект легкого колихання (Wind/Wobble effect)
                  // Перепиши ці пропси всередині <motion.button>
                  animate={{
                    // Кут повороту робимо мікроскопічним, бо при довжині 800px навіть 0.2 градуси дадуть помітний рух внизу
                    rotate: active ? [0, -0.15, 0.15, -0.05, 0.05, 0] : [0, -0.3, 0.3, -0.15, 0.15, 0],
                    // Зсув по Y теж робимо крихітним, щоб стрічка не стрибала вгору-вниз
                    y: active ? [0, 0.3, -0.2, 0.2, 0] : [0, 0.5, -0.3, 0.3, 0],
                  }}
                  transition={{
                    // Збільшуємо час (наприклад, до 8-10 секунд). Що довша стрічка, то повільніше вона має гойдатися
                    duration: active ? 7 : 9, 
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut", // Забезпечує максимально м'яке сповільнення в крайніх точках
                    delay: i * 0.6,    // Трішки більший розсинхрон між сусідніми закладками
                  }}

                  // 3. Фізика кліку (Замість GSAP timeline на клік)
                  whileTap={{ 
                    y: 25, // можна збільшити хід кліку, бо стрічка довга
                    scaleY: 1.02, // менше спотворення, щоб не розтягувати 800px ще сильніше
                    transition: { type: "spring", stiffness: 120, damping: 20 } // м'якша, важча пружина
                  }}
                  onClick={() => {
                    if (!active && !isAnimating.current) {
                      switchCategory(cat.key);
                    }
                  }}
                  
                  title={cat.key}
                  aria-label={cat.key}
                  aria-current={active ? "page" : undefined}
                  style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - ${NOTCH}px), 0 100%)`,
                    background: active ? "var(--accent)" : "var(--muted)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.18)",
                    marginTop: -PROTRUDE,
                    paddingTop: PROTRUDE + 10,
                    willChange: "transform",
                    originX: 0.5, // Центр гойдання по горизонталі
                    originY: 0,   // Гойдається ТІЛЬКИ від верхнього краю (як закріплена стрічка)
                  }}
                  className="relative w-10 sm:w-11 pb-4 flex justify-center items-start cursor-pointer border-none hover:brightness-110 transition-[filter] select-none touch-none"
                >
                  <Icon size={17} color="var(--paper-l)" />
                </motion.button>
              );
            })}
          </div>
      </div>

      {/* ── Book spread ── */}
      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden bg-[#d4ccbc]">

        {/* LEFT PAGE — vertical list on desktop, horizontal strip on mobile */}
        <div
          className="flex flex-col md:overflow-hidden bg-[var(--paper-l)] border-b md:border-b-0 md:border-r border-[var(--rule)] w-full md:w-[300px] flex-shrink-0"
          style={{ boxShadow: "2px 0 12px rgba(0,0,0,0.08)" }}
        >
          <div className="px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 md:pb-6 flex-shrink-0 border-b border-[var(--rule)]">
            <p
              className="text-lg uppercase text-[var(--muted)]"
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
                className="text-3xl font-bold text-[var(--ink)] mt-1 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <SplitText
                  text={activeCategory}
                  className="text-2xl font-semibold text-center"
                  delay={80}
                  duration={0.5}
                  ease="power3.out"
                  splitType="chars"
                  from={{ opacity: 0, y: 40 }}
                  to={{ opacity: 1, y: 0 }}
                  threshold={0.1}
                  rootMargin="-100px"
                  textAlign="center"
                />
              </motion.h2>
            </AnimatePresence>
            <div className="w-7 h-px bg-[var(--accent)] mt-2.5" />
              {/* 🔎 SEARCH */}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук по назві…"
                className="order-3 sm:order-2 w-full sm:w-auto sm:flex-1 sm:max-w-xs mt-2 px-3 py-1.5 outline-none text-lg text-[var(--ink)] bg-[var(--paper-r)] border border-[var(--rule)]"
                style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
              />
          </div>

          {/* Place list — horizontal scroll on mobile, vertical on desktop */}
          <div
            className="flex-1 md:overflow-y-auto py-3 md:py-4 overflow-x-auto md:overflow-x-visible"
            style={{ scrollbarWidth: "none" }}
          >
            
            {filtered.length === 0 && (
              <p
                className="px-4 sm:px-8 py-4 text-lg italic text-[var(--muted)]"
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
                className="flex md:block gap-2 px-4 sm:px-8 md:px-0"
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
                      className="text-left cursor-pointer bg-none border-none p-0 flex-shrink-0 w-[190px] md:w-full"
                    >
                      <div
                        className={`flex items-start gap-3 px-3 md:px-8 py-2.5 md:py-3 transition-colors duration-200 border md:border-0 md:border-l-[3px] ${
                          isActive
                            ? "bg-[var(--accent)]/[0.07] border-[var(--accent)] md:border-l-[var(--accent)]"
                            : "border-[var(--rule)] md:border-l-transparent"
                        }`}
                      >
                        <span
                          className="text-lg text-[var(--muted)] pt-[3px] min-w-[16px] text-right hidden md:inline"
                          style={{ fontFamily: "'EB Garamond', serif" }}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-lg leading-tight ${
                              isActive ? "font-bold text-[var(--ink)]" : "font-normal text-[var(--muted)]"
                            }`}
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {place.title}
                          </p>
                          {place.subtitle && (
                            <p
                              className="text-lg italic text-[var(--muted)] mt-0.5 truncate"
                              style={{ fontFamily: "'EB Garamond', serif" }}
                            >
                              {place.subtitle}
                            </p>
                          )}
                        </div>
                        {place.status && (
                          <span
                            className="flex-shrink-0 text-sm uppercase text-[var(--accent)] border border-[var(--accent)]/[0.27] px-1.5 py-0.5 mt-0.5 hidden md:inline-block"
                            style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.08em" }}
                          >
                            {place.status}
                          </span>
                        )}
                      </div>

                      {i < filtered.length - 1 && (
                        <div className="hidden md:block mx-2 border-b border-dotted border-[var(--rule)]" />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="hidden md:flex flex-shrink-0 px-8 py-4 items-center justify-between border-t border-[var(--rule)]">
            <span
              className="text-lg italic text-[var(--muted)]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              Де поїсти
            </span>
            <span
              className="text-lg text-[var(--muted)]"
              style={{ fontFamily: "'EB Garamond', serif" }}
            >
              {filtered.length}
            </span>
          </div>
        </div>

        {/* SPINE shadow — desktop only */}
        <div
          className="hidden md:block w-1.5 flex-shrink-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.14), rgba(0,0,0,0.04))" }}
        />

        {/* RIGHT PAGE */}
        <div className="flex-1 md:overflow-hidden" style={{ perspective: "1600px" }}>
          <AnimatePresence mode="wait">
            {selected ? (
              <>
              <motion.div
                key={pageFlipKey}
                className="md:h-full flex flex-col md:overflow-hidden bg-[var(--paper-r)]"
                style={{ transformOrigin: "left center", boxShadow: "-2px 0 8px rgba(0,0,0,0.04)" }}
                initial={{ rotateY: 40, opacity: 0, filter: "brightness(0.85)" }}
                animate={{ rotateY: 0, opacity: 1, filter: "brightness(1)" }}
                exit={{ rotateY: -25, opacity: 0, filter: "brightness(0.9)" }}
                transition={{ duration: 0.5, ease }}
              >
                <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">

                  {/* Image column */}
                  <div
                    className="flex flex-col md:overflow-hidden border-b md:border-b-0 md:border-r border-[var(--rule)] w-full md:w-[42%] flex-shrink-0"
                  >
                    <div className="flex-shrink-0 px-4 sm:px-6 md:px-7 py-3 flex items-center justify-between border-b border-[var(--rule)]">
                      <span
                        className="text-lg uppercase italic text-[var(--muted)]"
                        style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.22em" }}
                      >
                        {activeCategory}
                      </span>
                      <span className="text-lg text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>✦</span>
                    </div>

                    {selected.images?.[0] && (
                      <div className="flex flex-col px-4 sm:px-6 md:px-7 pt-4 md:pt-6 pb-3 md:pb-4 md:flex-1 md:overflow-hidden">
                        <div
                          className="relative border border-[var(--rule)] overflow-hidden h-48 sm:h-64 md:h-auto md:flex-1"
                          style={{ minHeight: 0 }}
                        >
                          <img src={selected.images[0]} alt={selected.title} className="w-full h-full object-cover" />
                          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 30px rgba(0,0,0,0.18)" }} />
                        </div>
                        <p
                          className="mt-2 text-center text-lg italic text-[var(--muted)]"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
                        >
                          {selected.title}{selected.subtitle ? ` — ${selected.subtitle}` : ""}
                        </p>
                      </div>
                    )}

                    <div className="px-4 sm:px-6 md:px-7 pb-4 md:pb-5 flex flex-col gap-2 border-t border-[var(--rule)] pt-3.5">
                      {selected.address && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <MapPin size={10} className="flex-shrink-0" />
                          <span className="text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.address}</span>
                        </div>
                      )}
                      {selected.openingHours && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Clock size={10} className="flex-shrink-0" />
                          <span className="text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.openingHours}</span>
                        </div>
                      )}
                      {selected.phone && (
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Phone size={10} className="flex-shrink-0" />
                          <span className="text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>{selected.phone}</span>
                        </div>
                      )}
                      {selected.website && (
                        <a
                          href={"https://"+selected.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[var(--accent)] no-underline"
                        >
                          <Globe size={10} className="flex-shrink-0" />
                          <span className="text-lg" style={{ fontFamily: "'EB Garamond', serif" }}>Сайт закладу</span>
                        </a>
                      )}
                      {(selected.yearBuilt || selected.visiting) && (
                        <div className="flex items-center justify-between mt-1">
                          {selected.yearBuilt && (
                            <span className="text-lg text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>
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
                    <div className="flex-1 min-h-0 flex flex-col md:overflow-hidden px-4 sm:px-6 md:px-10 py-5 md:py-8">
                      <div className="flex-shrink-0 flex items-center justify-between mb-4 md:mb-6 pb-3 border-b border-[var(--rule)]">
                        <span
                          className="text-[9px] sm:text-lg uppercase text-[var(--muted)]"
                          style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.18em" }}
                        >
                          Гастрономічний путівник
                        </span>
                        <span className="text-lg text-[var(--muted)]" style={{ fontFamily: "'EB Garamond', serif" }}>
                          {String(selectedIndex + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
                        </span>
                      </div>

                      <h1
                        className="font-bold text-[var(--ink)] leading-[1.15] mb-2"
                        style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 5vw, 2.8rem)" }}
                      >
                        {selected.title}
                      </h1>
                      {selected.subtitle && (
                        <p
                          className="text-lg italic text-[var(--muted)] mb-1"
                          style={{ fontFamily: "'EB Garamond', serif" }}
                        >
                          {selected.subtitle}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mb-4 md:mb-5 mt-3">
                        <div className="flex-1 h-px bg-[var(--rule)]" />
                        <span className="text-[12px] text-[var(--accent)]">❧</span>
                        <div className="flex-1 h-px bg-[var(--rule)]" />
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                        {selected.description && (
                          <p
                            className=" leading-[1.75] md:leading-[1.85] text-[var(--ink)] text-justify"
                            style={{ fontFamily: "'Lora', serif" }}
                          > 
                            <span
                              className="font-bold text-[var(--accent)] float-left mr-1.5 mt-1"
                              style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.2em", lineHeight: 0.78 }}
                            >
                              {selected.description[0]}
                            </span>
                            {selected.description.slice(1)}
                          </p>
                        )}

                        {/* Tags */}
                        {selected.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-5 md:mt-6">
                            {selected.tags.map((tag) => (
                              <span
                                key={tag}
                                className="flex items-center gap-1 text-lg text-[var(--muted)] border border-[var(--rule)] px-2.5 py-[3px]"
                                style={{ fontFamily: "'EB Garamond', serif", letterSpacing: "0.04em" }}
                              >
                                <Tag size={9} />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-6 md:mt-8">
                          <Link
                            href={`/site/InteractiveMap?id=${selected.id}`}
                            className="inline-block w-full sm:w-auto"
                          >
                            <button
                              className="w-full sm:w-auto cursor-pointer transition-colors duration-200 text-[var(--paper-r)] bg-[var(--accent)]"
                              style={{
                                fontFamily: "'EB Garamond', serif",
                                fontSize: 14,
                                letterSpacing: "0.22em",
                                textTransform: "uppercase",
                                border: "none",
                                padding: "12px 22px",
                              }}
                            >
                              Прокласти маршрут
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4 border-t border-[var(--rule)]">
                    <span
                      className="text-lg italic text-[var(--muted)] truncate"
                      style={{ fontFamily: "'EB Garamond', serif" }}
                    >
                      {selected.title}
                    </span>
                    {selected.type && (
                      <span className="text-lg text-[var(--muted)] flex-shrink-0 ml-2" style={{ fontFamily: "'EB Garamond', serif" }}>
                        {selected.type}
                      </span>
                    )}
                  </div>
                </motion.div>
              </>  
            ) : (
              <div className="h-40 md:h-full flex items-center justify-center bg-[var(--paper-r)]">
                <p
                  className="text-lg italic text-[var(--muted)]"
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