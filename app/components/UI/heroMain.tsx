"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  motion,
  motionValue,
  MotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Налаштування                                                      */
/* ------------------------------------------------------------------ */
const TITLE = ["Ч", "Е", "Р", "К", "А", "С", "И"];
const LETTER_CURVE = [10, 5, 2, 0, 2, 5, 10];
const MID = (TITLE.length - 1) / 2;

const HOVER_RADIUS = 340; // px: на якій відстані від курсора літера "прокидається"
const HOVER_LIFT = 28; // px: наскільки літера підстрибує
const HOVER_SCALE = 0.14; // +14% до розміру

/* Напис "стоїть" на місті: ми читаємо прозорість PNG-панорами, знаходимо
   лінію дахів під словом і садимо літери так, щоб їх низ ховався за будинками. */
const SKYLINE_PERCENTILE = 0.2; // 0 = сідати на найнижчий дах, 1 = на найвищий
const SINK_EM = 0.05; // на скільки (у висотах літери) низ літер ховається за містом
const FALLBACK_BOTTOM = "66%"; // якщо лінію дахів визначити не вдалося
const TITLE_SINK_VH = 22; // на скільки vh напис занурюється за місто при скролі

/* Ефект "гумки": літери відстають від скролу, а потім пружно доганяють його. */
const SCROLL_SMOOTH = {
  stiffness: 100,
  damping: 12,
  mass: 1,
  restDelta: 0.0005,
  restSpeed: 0.0005,
};
/* Наскільки літери розтягуються по висоті при швидкому скролі (0 = вимкнено) */
const STRETCH = 0.07;

const BREATHE_PX = 4;
const BREATHE_PERIOD = 5.6;
const BREATHE_STAGGER = 0.72;

const SHIMMER_START = 2.6;
const SHIMMER_DURATION = 1.7;
const SHIMMER_PERIOD = 6.5;
const SHIMMER_STAGGER = 0.11;
const SHIMMER_REST = "200% 0%, 0% 0%";

const SHIMMER_PCT = ((SHIMMER_DURATION / SHIMMER_PERIOD) * 100).toFixed(2);

const HERO_CSS = `
@keyframes hero-breathe {
  0%, 100% { transform: translate3d(0, 0, 0); }
  25%      { transform: translate3d(0, -${BREATHE_PX}px, 0); }
  75%      { transform: translate3d(0, ${BREATHE_PX}px, 0); }
}
@keyframes hero-shimmer {
  0% {
    background-position: 200% 0%, 0% 0%;
    animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  ${SHIMMER_PCT}%, 100% { background-position: -100% 0%, 0% 0%; }
}
.hero-breathe { 
  animation: hero-breathe ${BREATHE_PERIOD}s ease-in-out infinite;
  will-change: transform;
}
.hero-shimmer { 
  animation: hero-shimmer ${SHIMMER_PERIOD}s linear infinite;
  will-change: background-position;
}
[data-hero-paused="true"] .hero-breathe,
[data-hero-paused="true"] .hero-shimmer { animation-play-state: paused; }

.gpu-layer {
  transform: translateZ(0);
  backface-visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .hero-breathe, .hero-shimmer { animation: none; }
}
`;

/* ------------------------------------------------------------------ */
/*  Одна літера                                                       */
/* ------------------------------------------------------------------ */
type LetterProps = {
  letter: string;
  index: number;
  ready: boolean;
  reduced: boolean;
  influenceRaw: MotionValue<number>;
  progress: MotionValue<number>;
  letterEls: React.MutableRefObject<(HTMLSpanElement | null)[]>;
};

function Letter({
  letter,
  index,
  ready,
  reduced,
  influenceRaw,
  progress,
  letterEls,
}: LetterProps) {
  const offset = index - MID;

  const influence = useSpring(influenceRaw, {
    stiffness: 220,
    damping: 18,
    mass: 0.5,
  });

  const y = useTransform(influence, (v) => -v * HOVER_LIFT);
  const scale = useTransform(influence, (v) => 1 + v * HOVER_SCALE);
  const rotate = useTransform(influence, (v) => v * offset * 1.5);
  const spreadX = useTransform(progress, (v) => v * offset * 90);

  const hidden = reduced
    ? { opacity: 0, y: LETTER_CURVE[index] }
    : { opacity: 0, y: 140, rotateX: -85 };

  const delay = 0.7 + index * 0.08;

  return (
    <motion.span
      ref={(el) => {
        letterEls.current[index] = el;
      }}
      className="relative inline-block gpu-layer"
      style={{ transformOrigin: "50% 100%" }}
      initial={hidden}
      animate={
        ready
          ? {
              opacity: 1,
              y: LETTER_CURVE[index],
              rotateX: 0,
            }
          : {}
      }
      transition={{
        default: {
          type: "spring",
          stiffness: 90,
          damping: 14,
          mass: 0.9,
          delay,
        },
        opacity: { duration: 0.5, delay },
      }}
    >
      <span
        className="hero-breathe relative inline-block"
        style={{ animationDelay: `${-index * BREATHE_STAGGER}s` }}
      >
        <motion.span
          className="relative inline-block gpu-layer"
          style={{
            x: spreadX,
            y,
            scale,
            rotate,
            transformOrigin: "50% 60%",
          }}
        >
          {/* Задній шар */}
          <span
            className="block"
            style={{
              color: "#fff",
              textShadow: `
                0 3px 0 #ffffff,
                0 8px 0 rgba(170,195,220,0.85),
                0 16px 25px rgba(10,30,60,0.35)
              `,
            }}
          >
            {letter}
          </span>

          {/* Передній шар */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 block gpu-layer ${
              ready ? "hero-shimmer" : ""
            }`}
            style={{
              backgroundImage:
                "linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,226,160,0.95) 50%, rgba(255,255,255,0) 62%), linear-gradient(180deg, #ffffff 0%, #e3eef9 100%)",
              backgroundSize: "250% 100%, 100% 100%",
              backgroundRepeat: "no-repeat",
              backgroundPosition: SHIMMER_REST,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              animationDelay: `${SHIMMER_START + index * SHIMMER_STAGGER}s`,
            }}
          >
            {letter}
          </span>
        </motion.span>
      </span>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
export function HeroSection({ heroReady = true }: { heroReady?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, SCROLL_SMOOTH);
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scrollVelocity = useVelocity(smoothProgress);

  /* Пряма трансляція трансформацій через CSS variables */
  useEffect(() => {
    const textEl = textWrapperRef.current;
    if (!textEl) return;

    const unsubscribeProgress = smoothProgress.on("change", (v) => {
      textEl.style.setProperty("--text-y", `${v * TITLE_SINK_VH}vh`);
      const opacity = v < 0.25 ? 1 : Math.max(0, 1 - (v - 0.25) / 0.65);
      textEl.style.setProperty("--text-opacity", opacity.toString());
    });

    const unsubscribeVelocity = scrollVelocity.on("change", (vel) => {
      const clampedVel = Math.max(-3, Math.min(3, vel));
      const stretch = 1 + Math.abs(clampedVel) * STRETCH;
      textEl.style.setProperty("--text-stretch", stretch.toString());
    });

    return () => {
      unsubscribeProgress();
      unsubscribeVelocity();
    };
  }, [smoothProgress, scrollVelocity]);

  /* ---------- Пауза, коли hero не видно ---------- */
  const activeRef = useRef(true);
  useEffect(() => {
    const hero = containerRef.current;
    if (!hero) return;
    let inView = true;
    const sync = () => {
      const active = inView && !document.hidden;
      activeRef.current = active;
      hero.dataset.heroPaused = String(!active);
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(hero);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  /* ---------- Посадка напису на лінію дахів ---------- */
  const titleRef = useRef<HTMLHeadingElement>(null);
  const skylineRef = useRef<{ top: Float32Array; iw: number; ih: number } | null>(null);
  const [plant, setPlant] = useState<{ bottom: number; fontSize: number } | null>(null);

  const measure = useCallback(() => {
    const hero = containerRef.current;
    const title = titleRef.current;
    const sky = skylineRef.current;
    if (!hero || !title || !sky) return;

    const W = hero.clientWidth;
    const H = hero.clientHeight;
    const boxW = W;
    const boxH = H * 1.15;

    const scale = Math.max(boxW / sky.iw, boxH / sky.ih);
    const drawnW = sky.iw * scale;
    const drawnH = sky.ih * scale;
    const offX = (boxW - drawnW) / 2;
    const offY = (boxH - drawnH) / 2;

    const tw = title.offsetWidth;
    const x0 = W / 2 - tw / 2;
    const x1 = W / 2 + tw / 2;

    const heights: number[] = [];
    for (let px = x0; px <= x1; px += 12) {
      const u = Math.min(1, Math.max(0, (px - offX) / drawnW));
      const col = Math.min(sky.top.length - 1, Math.floor(u * sky.top.length));
      const yTop = sky.top[col] * drawnH + offY;
      heights.push(Math.max(0, boxH - yTop));
    }
    if (!heights.length) return;
    heights.sort((a, b) => a - b);

    const median = heights[heights.length >> 1];
    if (median < H * 0.05 || median > boxH * 0.97) {
      setPlant(null);
      return;
    }

    const surface = heights[Math.floor((heights.length - 1) * SKYLINE_PERCENTILE)];
    const fontSize = parseFloat(getComputedStyle(title).fontSize) || 200;
    const bottom = Math.min(
      H - fontSize * 1.25,
      Math.max(H * 0.12, surface - SINK_EM * fontSize)
    );
    setPlant({ bottom, fontSize });
  }, []);

  const onCityLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;

      const cw = Math.min(256, iw);
      const ch = Math.max(1, Math.round((cw * ih) / iw));
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      try {
        ctx.drawImage(img, 0, 0, cw, ch);
        const { data } = ctx.getImageData(0, 0, cw, ch);
        const top = new Float32Array(cw);
        for (let x = 0; x < cw; x++) {
          let row = ch;
          for (let y = 0; y < ch; y++) {
            if (data[(y * cw + x) * 4 + 3] >= 200) {
              row = y;
              break;
            }
          }
          top[x] = row / ch;
        }
        skylineRef.current = { top, iw, ih };
      } catch {
        skylineRef.current = null;
      }
      measure();
    },
    [measure]
  );

  useEffect(() => {
    const hero = containerRef.current;
    if (!hero) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  /* ---------- Геометрія літер ---------- */
  const letterEls = useRef<(HTMLSpanElement | null)[]>([]);
  const geomRef = useRef<{
    left: number;
    top: number;
    height: number;
    centers: { x: number; y: number }[];
  } | null>(null);

  const measureLetters = useCallback(() => {
    const hero = containerRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const centers: { x: number; y: number }[] = [];
    for (const el of letterEls.current) {
      if (!el) return;
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && n !== hero) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      centers.push({ x: x + el.offsetWidth / 2, y: y + el.offsetHeight / 2 });
    }
    geomRef.current = {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      height: hero.clientHeight,
      centers,
    };
  }, []);

  useEffect(() => {
    const hero = containerRef.current;
    const title = titleRef.current;
    if (!hero || !title) return;
    measureLetters();
    const ro = new ResizeObserver(measureLetters);
    ro.observe(hero);
    ro.observe(title);
    document.fonts?.ready.then(measureLetters);
    return () => ro.disconnect();
  }, [measureLetters]);

  useEffect(() => {
    measureLetters();
  }, [plant, measureLetters]);

  /* ---------- Курсор з Throttling (rAF) ---------- */
  const influences = useMemo(() => TITLE.map(() => motionValue(0)), []);

  useEffect(() => {
    if (reduced) return;

    let rafId: number | null = null;
    const zero = () => influences.forEach((mv) => mv.set(0));

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (rafId !== null) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const g = geomRef.current;
        if (!g || !activeRef.current) {
          zero();
          return;
        }

        const lx = e.clientX + window.scrollX - g.left;
        const ly = e.clientY + window.scrollY - g.top;
        const sink = smoothProgress.get() * (TITLE_SINK_VH / 100) * g.height;

        for (let i = 0; i < g.centers.length; i++) {
          const c = g.centers[i];
          const d = Math.hypot(lx - c.x, ly - (c.y + sink));
          influences[i].set(Math.max(0, 1 - d / HOVER_RADIUS));
        }
      });
    };

    const onLeave = zero;

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, influences, smoothProgress]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#6ba3d6] text-white"
    >
      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />

      {/* ШАР 1: НЕБО */}
      <motion.div
        style={{ y: skyY, willChange: "transform" }}
        className="absolute left-0 right-0 -top-[20%] z-0 h-[140%] gpu-layer"
        initial={{ opacity: 0 }}
        animate={heroReady ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #2b6cb0 0%, #2b6cb0 14.3%, #4285c5 35.7%, #6ba3d6 57.1%, #9ec3e6 78.6%, #e2eef7 100%)",
          }}
        />
      </motion.div>

      {/* ШАР 2: БЛОК З ЗАГОЛОВКОМ ТА ПІДЗАГОЛОВКОМ */}
      <div
        ref={textWrapperRef}
        style={{
          transform: "translate3d(0, var(--text-y, 0vh), 0) scaleY(var(--text-stretch, 1))",
          opacity: "var(--text-opacity, 1)",
          transformOrigin: "50% 100%",
          willChange: "transform, opacity",
          bottom: plant ? plant.bottom : FALLBACK_BOTTOM,
        }}
        className="
          pointer-events-none
          absolute
          left-0 right-0
          z-10
          flex flex-col items-center justify-center
          select-none
          gpu-layer
        "
      >
        {/* Контейнер підзаголовка та літер для збереження однакової ширини */}
        <div className="flex flex-col items-end">
          {/* Підзаголовок над текстом справа */}
          <span
            className="
              mb-2 pr-1 sm:pr-2
              text-xs sm:text-sm md:text-base
              font-extrabold
              uppercase
              tracking-[0.35em]
              text-white/95
              drop-shadow-[0_2px_6px_rgba(10,30,60,0.5)]
              text-right
            "
          >
            Туристичне місто
          </span>

          <h1
            ref={titleRef}
            aria-label="Черкаси"
            className="relative flex items-end justify-center font-black leading-none"
            style={{
              fontFamily: "Unbounded, sans-serif",
              fontSize: "clamp(4rem, 15vw, 13rem)",
              gap: "0.04em",
              perspective: 900,
            }}
          >
            {/* Сяйво під написом */}
            <motion.div
              aria-hidden
              initial={{ opacity: 0 }}
              animate={heroReady ? { opacity: 1 } : {}}
              transition={{ delay: 1.2, duration: 1.6 }}
              className="
                absolute
                left-1/2 top-1/2
                h-32 w-[90%]
                -translate-x-1/2 -translate-y-1/2
                rounded-full
                gpu-layer
              "
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0) 70%)",
              }}
            />

            {TITLE.map((letter, i) => (
              <Letter
                key={i}
                letter={letter}
                index={i}
                ready={heroReady}
                reduced={reduced}
                influenceRaw={influences[i]}
                progress={smoothProgress}
                letterEls={letterEls}
              />
            ))}
          </h1>
        </div>
      </div>

      {/* ШАР 3: ПАНОРАМА МІСТА */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-[115vh] gpu-layer">
        {plant && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 gpu-layer"
            style={{
              bottom: plant.bottom - plant.fontSize * 0.3,
              height: plant.fontSize * 0.75,
              background:
                "linear-gradient(to top, rgba(226,238,247,0.85) 0%, rgba(226,238,247,0.5) 45%, rgba(226,238,247,0) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={heroReady ? { opacity: 1 } : {}}
            transition={{ delay: 1.4, duration: 1.6 }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={heroReady ? { opacity: 1, y: 0 } : {}}
          transition={{
            delay: 0.3,
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative h-full w-full gpu-layer"
        >
          <Image
            src="/Banners/Heropart.png"
            alt="Панорама Черкас"
            fill
            priority
            sizes="100vw"
            unoptimized
            quality={100}
            onLoad={onCityLoad}
            className="object-cover"
          />
        </motion.div>
      </div>

      {/* ШАР 4: UI */}
      <div
        className="
          absolute
          inset-0
          z-40
          pointer-events-none
          flex flex-col
          justify-between
          p-8
        "
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={heroReady ? { opacity: 1 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex items-center gap-4 pointer-events-auto"
        />

        <div className="flex flex-col items-center gap-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.5, duration: 0.7 }}
            className="flex flex-wrap justify-center gap-4 pointer-events-auto"
          >
            <a
              href="/site/Attractions"
              className="
                rounded-xl
                bg-white
                px-8 py-4
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-black
                shadow-2xl
                transition
                hover:scale-105
              "
            >
              Досліджувати
            </a>

            <a
              href="/site/InteractiveMap"
              className="
                rounded-xl
                border border-white/80
                bg-black/20
                px-8 py-4
                text-xs
                font-bold
                uppercase
                tracking-widest
                text-white
                backdrop-blur-md
                transition
                hover:bg-white/20
              "
            >
              Маршрути
            </a>
          </motion.div>

          <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-widest text-white/80">
            <span className="animate-bounce text-4xl">↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}