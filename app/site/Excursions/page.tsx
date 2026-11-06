"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Clock3,
  MapPin,
} from "lucide-react";

type Excursion = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  duration: number;
  placeIds: number[];
  coverImage: string | null;
  status: string;
};

const letters = [
  { letter: "Ч", image: "/Letters/ch.png" },
  { letter: "Е", image: "/Letters/e.png" },
  { letter: "Р", image: "/Letters/r.png" },
  { letter: "К", image: "/Letters/k.png" },
  { letter: "А", image: "/Letters/a.png" },
  { letter: "С", image: "/Letters/s.png" },
  { letter: "І", image: "/Letters/y.png" },
];

/** Кількість екскурсій на одну літеру */
const PER_LETTER = 2;

/** Паралакс */
const PARALLAX = 6;

/** Максимальне затемнення */
const DIM_MAX = 0.25;

/** Магніт */
const MAGNET = true;

/** Затримка магніту */
const MAGNET_DELAY = 220;

/** Максимальна відстань, на якій магніт спрацьовує */
const MAX_SNAP_DISTANCE = 0.3;

/** Висота навбару */
const NAV_OFFSET = "5rem";

const colors = {
  heading: "#252D3C",
  accent: "#C94B35",
  body: "#666D78",
  muted: "#858B95",
  slideBg: "#FAF9F6",
};

const ROUTE_PERIOD = 880;

const ROUTE_PATH = `
  M 220 0
  C 115 60, 125 150, 220 185
  C 305 215, 395 165, 440 235
  C 485 305, 410 365, 360 315
  C 315 275, 360 225, 405 265
  C 490 330, 620 350, 750 390
  S 900 460, 865 550
  C 835 625, 740 630, 710 570
  C 680 510, 750 480, 790 530
  C 825 575, 770 630, 690 670
  S 420 780, 220 ${ROUTE_PERIOD}
`;

function WindingRoute() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-3 right-3 z-0 hidden sm:left-6 sm:right-6 md:left-12 md:right-12 md:block">
      <svg
        aria-hidden="true"
        viewBox={`0 0 1000 ${ROUTE_PERIOD}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
      >
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#C94B35B8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 11"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function RouteLetter({
  image,
  priority,
}: {
  image: string;
  priority: boolean;
}) {
  return (
    <div
      className="relative z-10 shrink-0"
      style={{
        // Висота залежить і від ширини, і від висоти екрана, пропорція 5:7
        height:
          "clamp(270px, min(68vw, calc((100vh - 5rem) * 0.8)), 760px)",
        aspectRatio: "5 / 7",
      }}
      aria-hidden="true"
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 640px) 52vw, (max-width: 1024px) 28vw, 540px"
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}

function ExcursionCard({
  excursion,
  number,
  letterLeft,
}: {
  excursion: Excursion;
  number: number;
  letterLeft: boolean;
}) {
  return (
    <Link
      href={`/site/Excursions/${excursion.slug}`}
      className={`group relative flex min-h-36 min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-900/10 bg-white/95 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-700/50 hover:shadow-lg sm:min-h-48 lg:min-h-60 ${
        letterLeft ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Фото */}
      <div className="relative w-[42%] shrink-0 overflow-hidden sm:w-1/2 lg:w-[52%]">
        <Image
          src={
            excursion.coverImage ||
            "/PlacesPhoto/sosnovyj-bir.jpg"
          }
          alt={excursion.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 30vw, 480px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Інформація */}
      <div className="flex min-w-0 flex-1 flex-col justify-center p-2.5 sm:p-4 lg:p-6">
        <p
          className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.18em] sm:text-[10px] lg:text-xs"
          style={{ color: colors.accent }}
        >
          МАРШРУТ {String(number).padStart(2, "0")}
        </p>

        <h2
          className="line-clamp-4 pr-5 text-sm font-bold leading-tight tracking-tight sm:text-lg lg:text-2xl"
          style={{ color: colors.heading }}
        >
          {excursion.title}
        </h2>

        <p
          className="mt-1 line-clamp-4 text-[10px] leading-snug sm:text-sm lg:text-base"
          style={{ color: colors.body }}
        >
          {excursion.subtitle || "Відкрийте для себе Черкаси"}
        </p>

        <p
          className="mt-3 hidden max-w-2xl text-sm leading-6 lg:line-clamp-4"
          style={{ color: colors.muted }}
        >
          {excursion.description}
        </p>

        {/* Метадані */}
        <div
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] sm:gap-x-5 sm:text-xs lg:text-sm"
          style={{ color: colors.muted }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} strokeWidth={1.8} />
            {excursion.duration} хв
          </span>

          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} strokeWidth={1.8} />
            {excursion.placeIds.length} локації
          </span>
        </div>
      </div>

      {/* Стрілка */}
      <div
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-slate-900/10 bg-white transition duration-300 group-hover:border-transparent group-hover:bg-orange-700 group-hover:text-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        style={{ color: colors.heading }}
      >
        <ArrowUpRight size={18} strokeWidth={1.8} />
      </div>
    </Link>
  );
}

export default function ExcursionsPage() {
  const trackRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dimRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [active, setActive] = useState(0);

  // Дані екскурсій з API
  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchExcursions = async () => {
      try {
        const response = await fetch("/api/excursions", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити екскурсії");
        }

        const data = await response.json();

        // Перевіряємо структуру відповіді API
        if (!data || !Array.isArray(data.excursions)) {
          console.error("Некоректна відповідь API:", data);
          throw new Error("API повернув некоректний формат даних");
        }

        // Отримуємо тільки опубліковані екскурсії
        setExcursions(
          data.excursions.filter(
            (excursion: Excursion) =>
              excursion.status === "published"
          )
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Помилка завантаження екскурсій:",
          error
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchExcursions();

    return () => {
      controller.abort();
    };
  }, []);

  // Групування екскурсій
  const rows: Excursion[][] = [];

  for (let i = 0; i < excursions.length; i += PER_LETTER) {
    rows.push(excursions.slice(i, i + PER_LETTER));
  }

  const total = rows.length;

  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    const sticky = stickyRef.current;

    if (!track || !sticky || total === 0) return;

    let raf = 0;
    let lastActive = -1;
    let cachedRect: DOMRect | null = null;
    let stickyOffsetTop = 0;
    let stickyHeight = 0;

    const updateMetrics = () => {
      stickyHeight = sticky.offsetHeight;

      const isMobile = window.matchMedia(
        "(max-width: 639px)"
      ).matches;

      // На телефоні збільшуємо відстань між перелистуваннями
      const slideDistance = stickyHeight * (isMobile ? 2 : 1);

      // Висота секції: перший екран + відстань між слайдами
      track.style.height = `${
        stickyHeight + (total - 1) * slideDistance
      }px`;

      cachedRect = track.getBoundingClientRect();

      stickyOffsetTop =
        parseFloat(getComputedStyle(sticky).top) || 0;
    };

    updateMetrics();

    const readTarget = () => {
      if (!cachedRect) return 0;

      const travel = cachedRect.height - stickyHeight;

      const scrolled =
        stickyOffsetTop - track.getBoundingClientRect().top;

      const p =
        travel > 0
          ? Math.min(1, Math.max(0, scrolled / travel))
          : 0;

      return p * Math.max(total - 1, 0);
    };

    const render = (pos: number) => {
      for (let i = 0; i < total; i++) {
        const el = slideRefs.current[i];

        if (!el) continue;

        const enter =
          i === 0
            ? 1
            : Math.min(1, Math.max(0, pos - (i - 1)));

        const covered = Math.min(1, Math.max(0, pos - i));

        const y = (1 - enter) * 100 - covered * PARALLAX;

        el.style.transform = `translate3d(0, ${y}%, 0)`;

        const dim = dimRefs.current[i];

        if (dim) {
          dim.style.opacity = String(covered * DIM_MAX);
        }

        const shouldHide = enter <= 0 || covered >= 1;

        const currentVisibility = el.style.visibility;

        const newVisibility = shouldHide
          ? "hidden"
          : "visible";

        if (currentVisibility !== newVisibility) {
          el.style.visibility = newVisibility;
        }
      }

      const nextActive = Math.round(pos);

      if (nextActive !== lastActive) {
        lastActive = nextActive;
        setActive(nextActive);
      }
    };

    const tick = () => {
      raf = 0;
      render(readTarget());
    };

    const schedule = () => {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    };

    // Магнітний скрол
    let snapTimer = 0;
    let touching = false;

    const snap = () => {
      if (!MAGNET || total < 2 || touching || !cachedRect) {
        return;
      }

      const travel = cachedRect.height - stickyHeight;

      const scrolled =
        stickyOffsetTop - track.getBoundingClientRect().top;

      if (travel <= 0 || scrolled <= 0 || scrolled >= travel) {
        return;
      }

      const idx = Math.round(
        (scrolled / travel) * (total - 1)
      );

      const delta =
        (idx / (total - 1)) * travel - scrolled;

      const slideDistance = travel / (total - 1);

      if (
        Math.abs(delta) > slideDistance * MAX_SNAP_DISTANCE ||
        Math.abs(delta) < 2
      ) {
        return;
      }

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      window.scrollTo({
        top: window.scrollY + delta,
        behavior: reduce ? "auto" : "smooth",
      });
    };

    const scheduleSnap = () => {
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(snap, MAGNET_DELAY);
    };

    const onScroll = () => {
      schedule();
      scheduleSnap();
    };

    const onTouchStart = () => {
      touching = true;
      window.clearTimeout(snapTimer);
    };

    const onTouchEnd = () => {
      touching = false;
      scheduleSnap();
    };

    tick();

    const handleResize = () => {
      updateMetrics();
      schedule();
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleResize, {
      passive: true,
    });

    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
    });

    window.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    window.addEventListener("touchcancel", onTouchEnd, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);

      window.clearTimeout(snapTimer);

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, [total]);

  const viewportH = `calc(100vh - ${NAV_OFFSET})`;

  // Завантаження
  if (loading) {
    return (
      <main className="mt-20 flex min-h-[70vh] items-center justify-center">
        <p style={{ color: colors.body }}>
          Завантаження екскурсій...
        </p>
      </main>
    );
  }

  // Немає опублікованих екскурсій
  if (excursions.length === 0) {
    return (
      <main className="mt-20 flex min-h-[70vh] items-center justify-center">
        <p style={{ color: colors.body }}>
          Наразі немає доступних екскурсій.
        </p>
      </main>
    );
  }

  return (
    <main
      className="mt-20 min-h-screen overflow-x-clip"
      style={{ color: colors.heading }}
    >
      {/* Intro */}
      <section className="relative w-full px-3 sm:px-6 md:px-12">
        <div className="relative z-10 grid items-center gap-10 pb-10 sm:pb-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pb-16">
          {/* Текст */}
          <div>
            <p
              className="mb-3 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: colors.accent }}
            >
              <span
                className="h-px w-8"
                style={{ backgroundColor: colors.accent }}
              />
              Обирай свій маршрут
            </p>

            <h2 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Куди вирушимо
              <br />
              <span style={{ color: colors.accent }}>
                сьогодні?
              </span>
            </h2>

            <p
              className="mt-5 max-w-xl text-[15px] leading-7 sm:text-base"
              style={{ color: colors.body }}
            >
              Кожна літера — дві нові історії. Гортай вниз,
              обирай екскурсію та відкривай знайомі й
              незнайомі куточки Черкас.
            </p>
          </div>

          {/* Літери */}
          <div className="flex flex-col items-center gap-6 lg:items-end">
            {/* ЧЕРКАСИ з мініатюр */}
            <div className="flex items-end justify-center -space-x-1 sm:space-x-1">
              {letters.map((l, i) => (
                <div
                  key={l.letter}
                  aria-hidden="true"
                  className="relative h-16 w-11 rounded-xl border border-slate-900/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-2 sm:h-24 sm:w-16 lg:h-40 lg:w-[120px]"
                  style={{
                    transform: `rotate(${
                      i % 2 === 0 ? -4 : 4
                    }deg) translateY(${i % 2 === 0 ? 0 : 8}px)`,
                  }}
                >
                  <Image
                    src={l.image}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain px-1.5 py-3"
                    style={{
                      imageRendering: "auto",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Підказка */}
        <div
          className="relative z-10 flex items-center gap-3 pb-6 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: colors.muted }}
        >
          <span className="h-px flex-1 bg-slate-900/10" />
          <span className="inline-flex items-center gap-2">
            Гортай вниз
            <ArrowDown
              size={14}
              strokeWidth={1.8}
              className="animate-bounce"
            />
          </span>
          <span className="h-px flex-1 bg-slate-900/10" />
        </div>
      </section>

      {/* Слайди */}
      <section
        id="excursion-route"
        ref={trackRef}
        className="relative w-full"
        style={{
          height: `calc(${total} * ${viewportH})`,
        }}
      >
        <div
          ref={stickyRef}
          className="sticky overflow-hidden"
          style={{
            top: NAV_OFFSET,
            height: viewportH,
          }}
        >
          {rows.map((items, rowIndex) => {
            const letter = letters[rowIndex % letters.length];
            const letterLeft = rowIndex % 2 === 0;

            return (
              <div
                key={items[0].id}
                ref={(el) => {
                  slideRefs.current[rowIndex] = el;
                }}
                className="absolute inset-0 flex items-center px-3 sm:px-6 md:px-12"
                style={{
                  zIndex: rowIndex + 1,
                  backgroundColor: colors.slideBg,
                  willChange: "transform",
                  ...(rowIndex === 0
                    ? {}
                    : {
                        borderTop: "1px solid #252D3C1A",
                      }),
                }}
              >
                {/* Тінь верхнього краю */}
                {rowIndex > 0 && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-full h-14"
                    style={{
                      background:
                        "linear-gradient(to top, #252D3C38, transparent)",
                    }}
                  />
                )}

                {/* Затемнення */}
                {rowIndex < total - 1 && (
                  <div
                    aria-hidden="true"
                    ref={(el) => {
                      dimRefs.current[rowIndex] = el;
                    }}
                    className="pointer-events-none absolute inset-0 z-20"
                    style={{
                      opacity: 0,
                      backgroundColor: "#252D3C",
                      willChange: "opacity",
                    }}
                  />
                )}

                <WindingRoute />

                {/* Літера + картки */}
                <div
                  className={`relative z-10 flex w-full min-w-0 items-center gap-3 sm:gap-6 md:gap-16 lg:gap-24 ${
                    letterLeft
                      ? "flex-col sm:flex-row"
                      : "flex-col sm:flex-row-reverse"
                  }`}
                >
                  <div className="flex shrink-0 justify-center">
                    <RouteLetter
                      image={letter.image}
                      priority={rowIndex < 2}
                    />
                  </div>

                  <div className="flex w-full min-w-0 flex-1 flex-col gap-3 sm:gap-4 lg:gap-5">
                    {items.map((excursion, i) => (
                      <ExcursionCard
                        key={excursion.id}
                        excursion={excursion}
                        number={rowIndex * PER_LETTER + i + 1}
                        letterLeft={letterLeft}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Індикатор слайдів */}
          <div
            className="pointer-events-none absolute right-1 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 sm:right-2"
            style={{ zIndex: total + 2 }}
            aria-hidden="true"
          >
            {rows.map((_, i) => (
              <span
                key={i}
                className="block w-1.5 rounded-full transition-all duration-300"
                style={{
                  height: i === active ? 28 : 8,
                  backgroundColor:
                    i === active
                      ? colors.accent
                      : "#252D3C33",
                }}
              />
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}