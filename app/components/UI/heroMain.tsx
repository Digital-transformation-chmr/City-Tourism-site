"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Налаштування — крутіть тут                                        */
/* ------------------------------------------------------------------ */
const TITLE = ["Ч", "Е", "Р", "К", "А", "С", "И"];
const LETTER_CURVE = [10, 5, 2, 0, 2, 5, 10]; // легка дуга
const MID = (TITLE.length - 1) / 2;

const HOVER_RADIUS = 340; // px: на якій відстані від курсора літера "прокидається"
const HOVER_LIFT = 28; // px: наскільки літера підстрибує
const HOVER_SCALE = 0.14; // +14% до розміру

/* Напис "стоїть" на місті: ми читаємо прозорість PNG-панорами, знаходимо
   лінію дахів під словом і садимо літери так, щоб їх низ ховався за будинками. */
const SKYLINE_PERCENTILE = 0.2; // 0 = сідати на найнижчий дах, 1 = на найвищий
const SINK_EM = 0.05; // на скільки (у висотах літери) низ літер ховається за містом
const FALLBACK_BOTTOM = "66%"; // якщо лінію дахів визначити не вдалося
const CITY_BLEED = 32; // px: запас панорами по боках для паралаксу

const SHIMMER_START = 2.6; // с: коли вперше пробігає світло
const SHIMMER_DURATION = 1.7; // с: тривалість одного проходу
const SHIMMER_PERIOD = 6.5; // с: період повторення
const SHIMMER_STAGGER = 0.11; // с: затримка між літерами (біжить зліва направо)
const SHIMMER_REST = "200% 0%, 0% 0%"; // промінь за межами літери

/* ------------------------------------------------------------------ */
/*  Одна літера                                                       */
/* ------------------------------------------------------------------ */
type LetterProps = {
  letter: string;
  index: number;
  ready: boolean;
  reduced: boolean;
  time: MotionValue<number>;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  /** true, поки hero видно на екрані — інакше анімації "у спокої" не рахуються */
  activeRef: React.MutableRefObject<boolean>;
};

function Letter({
  letter,
  index,
  ready,
  reduced,
  time,
  pointerX,
  pointerY,
  scrollYProgress,
  activeRef,
}: LetterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const offset = index - MID;

  // Наскільки курсор близько до літери: 0..1
  const rawInfluence = useTransform([pointerX, pointerY], ([x, y]: number[]) => {
    const el = ref.current;
    if (!el || !activeRef.current) return 0;
    const r = el.getBoundingClientRect();
    const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
    return Math.max(0, 1 - d / HOVER_RADIUS);
  });
  const influence = useSpring(rawInfluence, {
    stiffness: 220,
    damping: 16,
    mass: 0.6,
  });

  // Підстрибування + повільне "дихання" у спокої
  const y = useTransform([influence, time], ([inf, t]: number[]) => {
    const idle =
      reduced || !activeRef.current ? 0 : Math.sin(t / 900 + index * 0.8) * 4;
    return -inf * HOVER_LIFT + idle;
  });
  const scale = useTransform(influence, (v) => 1 + v * HOVER_SCALE);
  const rotate = useTransform(influence, (v) => v * offset * 1.5);

  // Скрол: літери розлітаються (лише transform — без filter/blur, це дорого)
  const spreadX = useTransform(scrollYProgress, [0, 1], [0, offset * 90]);

  // Золотий промінь світла, що пробігає крізь слово
  const shimmerPos = useTransform(time, (t) => {
    // поза кадром або між проходами — те саме значення => DOM не чіпаємо
    if (!activeRef.current) return SHIMMER_REST;
    const s =
      ((((t / 1000 - SHIMMER_START - index * SHIMMER_STAGGER) % SHIMMER_PERIOD) +
        SHIMMER_PERIOD) %
        SHIMMER_PERIOD);
    if (s >= SHIMMER_DURATION) return SHIMMER_REST;
    const p = s / SHIMMER_DURATION;
    const eased = 1 - Math.pow(1 - p, 2);
    const pos = 200 - 300 * eased; // 200% -> -100% (зліва направо)
    return `${pos.toFixed(1)}% 0%, 0% 0%`;
  });

  const hidden = reduced
    ? { opacity: 0, y: LETTER_CURVE[index] }
    : { opacity: 0, y: 140, rotateX: -85 };

  const delay = 0.7 + index * 0.08;

  return (
    <motion.span
      ref={ref}
      className="relative inline-block"
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
      <motion.span
        className="relative inline-block"
        style={{
          x: spreadX,
          y,
          scale,
          rotate,
          transformOrigin: "50% 60%",
          willChange: "transform",
        }}
      >
        {/* Задній шар: біла літера з об'ємною "екструзією" */}
        <span
          className="block"
          style={{
            color: "#fff",
            textShadow: `
              0 2px 0 #ffffff,
              0 6px 0 rgba(190,210,230,0.9),
              0 12px 0 rgba(140,170,200,0.6),
              0 20px 40px rgba(10,30,60,0.4)
            `,
          }}
        >
          {letter}
        </span>

        {/* Передній шар: ледь блакитний градієнт + золотий промінь */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 block"
          style={{
            backgroundImage:
              "linear-gradient(105deg, rgba(255,255,255,0) 38%, rgba(255,226,160,0.95) 50%, rgba(255,255,255,0) 62%), linear-gradient(180deg, #ffffff 0%, #e3eef9 100%)",
            backgroundSize: "250% 100%, 100% 100%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: shimmerPos,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
          }}
        >
          {letter}
        </motion.span>
      </motion.span>
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
export function HeroSection({ heroReady = true }: { heroReady?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const time = useTime();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* ---------- Паралакс від скролу ---------- */
  // Небо трохи відстає від скролу. Шар вищий за hero і виступає вгору,
  // тому зверху ніколи не оголюється фон.
  const skyY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  // Напис не летить угору, а поступово "занурюється" за будинки
  const textY = useTransform(scrollYProgress, [0, 1], ["0vh", "22vh"]);
  const textOpacity = useTransform(scrollYProgress, [0.25, 0.9], [1, 0]);
  const cityY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  /* ---------- Пауза, коли hero не видно ---------- */
  // Поки hero за кадром (або вкладка неактивна) — жодних обчислень "у спокої"
  const activeRef = useRef(true);
  useEffect(() => {
    const hero = containerRef.current;
    if (!hero) return;
    let inView = true;
    const sync = () => {
      activeRef.current = inView && !document.hidden;
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
  const skylineRef = useRef<{ top: Float32Array; iw: number; ih: number } | null>(
    null
  );
  const [plant, setPlant] = useState<{ bottom: number; fontSize: number } | null>(
    null
  );

  const measure = useCallback(() => {
    const hero = containerRef.current;
    const title = titleRef.current;
    const sky = skylineRef.current;
    if (!hero || !title || !sky) return;

    const W = hero.clientWidth;
    const H = hero.clientHeight;
    const boxW = W + CITY_BLEED * 2;
    const boxH = H * 1.15; // h-[115vh]

    // object-cover: як картинка лягає у свій бокс
    const scale = Math.max(boxW / sky.iw, boxH / sky.ih);
    const drawnW = sky.iw * scale;
    const drawnH = sky.ih * scale;
    const offX = (boxW - drawnW) / 2;
    const offY = (boxH - drawnH) / 2;

    // Скільки місця займає слово по горизонталі
    const tw = title.offsetWidth;
    const x0 = W / 2 - tw / 2;
    const x1 = W / 2 + tw / 2;

    const heights: number[] = [];
    for (let px = x0; px <= x1; px += 8) {
      const u = Math.min(1, Math.max(0, (px + CITY_BLEED - offX) / drawnW));
      const col = Math.min(sky.top.length - 1, Math.floor(u * sky.top.length));
      const yTop = sky.top[col] * drawnH + offY; // від верху боксу
      heights.push(Math.max(0, boxH - yTop)); // висота даху над низом hero
    }
    if (!heights.length) return;
    heights.sort((a, b) => a - b);

    // PNG без прозорості (або порожній) — обрій не знайти, лишаємо запасний варіант
    const median = heights[heights.length >> 1];
    if (median < H * 0.05 || median > boxH * 0.97) {
      setPlant(null);
      return;
    }

    const surface = heights[Math.floor((heights.length - 1) * SKYLINE_PERCENTILE)];
    const fontSize = parseFloat(getComputedStyle(title).fontSize) || 200;
    const bottom = Math.min(
      H - fontSize * 1.25, // слово завжди лишається в кадрі
      Math.max(H * 0.12, surface - SINK_EM * fontSize)
    );
    setPlant({ bottom, fontSize });
  }, []);

  // Викликається, коли панорама завантажилась: знімаємо профіль дахів
  const onCityLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;

      const cw = Math.min(320, iw);
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
    // шрифт Unbounded змінює ширину слова після завантаження
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  /* ---------- Курсор ---------- */
  // Позиція у координатах вікна (для літер)
  const pointerX = useMotionValue(-9999);
  const pointerY = useMotionValue(-9999);
  // Нормалізована позиція -0.5..0.5 (для паралаксу шарів)
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, { stiffness: 60, damping: 18 });
  const sy = useSpring(ny, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduced) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointerX.set(e.clientX);
      pointerY.set(e.clientY);
      nx.set(e.clientX / window.innerWidth - 0.5);
      ny.set(e.clientY / window.innerHeight - 0.5);
    };
    const onLeave = () => {
      pointerX.set(-9999);
      pointerY.set(-9999);
      nx.set(0);
      ny.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, pointerX, pointerY, nx, ny]);

  // Глибина: усі шари зміщуються в один бік, чим ближче — тим сильніше.
  // Так напис не "їздить" відносно міста, на якому стоїть.
  const skyX = useTransform(sx, (v) => v * -10);
  const titleX = useTransform(sx, (v) => v * -22);
  const titleRotY = useTransform(sx, (v) => v * 6);
  const titleRotX = useTransform(sy, (v) => v * -4);
  const cityX = useTransform(sx, (v) => v * -44);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-[#6ba3d6] text-white"
    >
      {/* ===================================================== */}
      {/* ШАР 1: НЕБО                                           */}
      {/* ===================================================== */}
      <motion.div
        style={{ y: skyY, x: skyX, willChange: "transform" }}
        className="absolute -left-10 -right-10 -top-[20%] z-0 h-[140%]"
        initial={{ opacity: 0 }}
        animate={heroReady ? { opacity: 1 } : {}}
        transition={{ duration: 1.2 }}
      >
        {/* Градієнт неба (inline, бо Tailwind не переварює переноси рядків
            всередині bg-[linear-gradient(...)]).
            Шар розтягнутий на 140% висоти, тому кольори тут підігнані так,
            щоб у видимій частині виглядало як раніше. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #2b6cb0 0%, #2b6cb0 14.3%, #4285c5 35.7%, #6ba3d6 57.1%, #9ec3e6 78.6%, #e2eef7 100%)",
          }}
        />
      </motion.div>

      {/* ===================================================== */}
      {/* ШАР 2: ЧЕРКАСИ                                        */}
      {/* ===================================================== */}
      <motion.div
        style={{
          y: textY,
          x: titleX,
          opacity: textOpacity,
          rotateX: titleRotX,
          rotateY: titleRotY,
          transformPerspective: 1200,
          willChange: "transform, opacity",
          bottom: plant ? plant.bottom : FALLBACK_BOTTOM,
        }}
        className="
          pointer-events-none
          absolute
          left-0 right-0
          z-10
          flex justify-center
          select-none
        "
      >
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
            "
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 72%)",
            }}
          />

          {TITLE.map((letter, i) => (
            <Letter
              key={i}
              letter={letter}
              index={i}
              ready={heroReady}
              reduced={reduced}
              time={time}
              pointerX={pointerX}
              pointerY={pointerY}
              scrollYProgress={scrollYProgress}
              activeRef={activeRef}
            />
          ))}
        </h1>
      </motion.div>

      {/* ===================================================== */}
      {/* ШАР 3: ПАНОРАМА МІСТА                                 */}
      {/* ===================================================== */}
      <motion.div
        style={{
          y: cityY,
          x: cityX,
          left: -CITY_BLEED,
          right: -CITY_BLEED,
          willChange: "transform",
        }}
        className="absolute bottom-0 z-20 h-[115vh]"
      >
        {/* Серпанок біля основи літер: лежить між написом і будинками,
            ховає стик і додає атмосферної глибини */}
        {plant && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0"
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
          className="relative h-full w-full"
        >
          <Image
            src="/Banners/Heropart.png"
            alt="Панорама Черкас"
            fill
            priority
            sizes="100vw"
            onLoad={onCityLoad}
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      {/* ===================================================== */}
      {/* ШАР 4: UI                                             */}
      {/* ===================================================== */}
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
        {/* Верхній напис */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={heroReady ? { opacity: 1, x: 0 } : {}}
          transition={{
            delay: 1.2,
            duration: 0.6,
          }}
          className="
            flex items-center gap-4
            pointer-events-auto
          "
        ></motion.div>

        {/* Нижні кнопки */}
        <div
          className="
            flex flex-col
            items-center
            gap-6
            pb-4
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : {}}
            transition={{
              delay: 1.5,
              duration: 0.7,
            }}
            className="
              flex
              flex-wrap
              justify-center
              gap-4
              pointer-events-auto
            "
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

          {/* Scroll */}
          <div
            className="
              flex
              flex-col
              items-center
              gap-1
              text-[10px]
              uppercase
              tracking-widest
              text-white/80
            "
          >
            <span className="animate-bounce text-4xl">↓</span>
          </div>
        </div>
      </div>
    </div>
  );
}