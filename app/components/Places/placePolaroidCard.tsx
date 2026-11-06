'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Place } from "./placeCard";

gsap.registerPlugin(ScrollTrigger);

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ───────────────────────── Константи мотузки ───────────────────────── */
const ROPE_Y = 8;   // висота мотузки від верху рядка (на краях)
const DROP = 12;    // відстань від мотузки до верхнього краю картки (тут «прищіпка»)
const PAD = 26;     // на скільки мотузка виходить за краї рядка

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const seedFrom = (v: unknown) => {
  const str = String(v ?? "");
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h % 100);
};

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ───────────────────────── Фізика: маятник ─────────────────────────
   Кожен елемент — затухаючий маятник, що гойдається навколо мотузки.
   θ'' = -ω²θ - 2ζωθ' + вітер.  Поштовхи (kick) додаються до швидкості. */
interface SwingOptions {
  omega?: number;    // власна частота (більше = коротший маятник, швидше хитається)
  zeta?: number;     // згасання (0.05 = довго гойдається, 0.3 = швидко завмирає)
  seed?: number;     // зсув фази «вітру», щоб картки не гойдались синхронно
  maxAngle?: number; // обмеження кута
}

function useSwing(
  ref: RefObject<HTMLElement | null>,
  { omega = 3, zeta = 0.35, seed = 0, maxAngle = 28 }: SwingOptions = {}
) {
  const state = useRef({ angle: 0, vel: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const s = state.current;
    let raf = 0;
    let last = 0;

    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;

      const acc = -omega * omega * s.angle - 2 * zeta * omega * s.vel;

      s.vel += acc * dt;
      s.angle += s.vel * dt;

      if (Math.abs(s.angle) > maxAngle) {
        s.angle = Math.sign(s.angle) * maxAngle;
        s.vel *= -0.3;
      }

      // Маятник заспокоївся — повністю зупиняємо анімацію
      if (Math.abs(s.angle) < 0.04 && Math.abs(s.vel) < 0.08) {
        s.angle = 0;
        s.vel = 0;
        el.style.transform = "rotate(0deg)";
        raf = 0;
        return;
      }

      el.style.transform = `rotate(${s.angle.toFixed(3)}deg)`;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    // Поштовх (від GSAP при появі або від kick()) — запускає цикл
    const onKick = (e: Event) => {
      const impulse = Number((e as CustomEvent<number>).detail) || 0;
      s.vel += impulse;
      start();
    };
    el.addEventListener("kick", onKick);

    // Поза екраном цикл не крутимо
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          stop();
          return;
        }
        if (Math.abs(s.angle) >= 0.04 || Math.abs(s.vel) >= 0.08) start();
      },
      { rootMargin: "120px" }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      stop();
      el.removeEventListener("kick", onKick);
    };
  }, [ref, omega, zeta, seed, maxAngle]);

  return useCallback(
    (impulse: number) => {
      state.current.vel += impulse;
      // будимо цикл, якщо маятник стояв
      ref.current?.dispatchEvent(new CustomEvent("kick", { detail: 0 }));
    },
    [ref]
  );
}

/* ───────────────────────── Мотузка ───────────────────────── */
function ropeSagAt(x: number, width: number, sag: number) {
  const u = (x + PAD) / (width + PAD * 2);
  return 4 * sag * u * (1 - u); // та сама парабола, що й намальована мотузка
}

/** Міряє ширину контейнера і опускає кожен [data-hang] до рівня мотузки в його точці. */
function useRope(ref: RefObject<HTMLElement | null>, sag: number, deps: unknown[]) {
  const [width, setWidth] = useState(0);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const w = el.clientWidth;
      setWidth(w);
      el.querySelectorAll<HTMLElement>("[data-hang]").forEach((node) => {
        const cx = node.offsetLeft + node.offsetWidth / 2;
        node.style.paddingTop = `${ROPE_Y + ropeSagAt(cx, w, sag) + DROP}px`;
      });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, sag, ...deps]);

  return width;
}

function Rope({ width, sag }: { width: number; sag: number }) {
  if (!width) return null;
  const total = width + PAD * 2;
  const d = `M 0 ${ROPE_Y} Q ${total / 2} ${ROPE_Y + 2 * sag} ${total} ${ROPE_Y}`;

  return (
    <svg
      aria-hidden
      className="absolute pointer-events-none z-0"
      style={{
        left: -PAD,
        top: 0,
        overflow: "visible",
        filter: "drop-shadow(0 5px 3px rgba(0,0,0,0.35))",
      }}
      width={total}
      height={sag + ROPE_Y * 2}
    >
      {/* шнурок */}
      <path d={d} fill="none" stroke="#6b4e2e" strokeWidth={3.5} strokeLinecap="round" />
      {/* перевитий малюнок */}
      <path d={d} fill="none" stroke="#c4a06a" strokeWidth={3.5} strokeDasharray="2 5" />
      {/* цвяшки */}
      {[0, total].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={ROPE_Y} r={6} fill="#4b4f55" stroke="#1f2227" strokeWidth={1.5} />
          <circle cx={cx - 1.5} cy={ROPE_Y - 1.5} r={1.8} fill="#9aa1a9" />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── Прищіпка ───────────────────────── */
function Clothespin({ small = false }: { small?: boolean }) {
  const w = small ? 12 : 18;
  const h = small ? 30 : 44;
  const up = small ? 8 : 10;

  return (
    <div
      className="absolute left-1/2 z-30 pointer-events-none"
      style={{ top: -(DROP + up), width: w, height: h, transform: "translateX(-50%)" }}
    >
      <div
        className="absolute inset-0"
        style={{
          borderRadius: 4,
          background: "linear-gradient(90deg,#e0b072 0%,#c48b4c 42%,#9c6a35 58%,#c9954f 100%)",
          boxShadow: "0 3px 6px rgba(0,0,0,.4), inset 0 0 0 1px rgba(80,48,16,.55)",
        }}
      />
      {/* щілина між половинками */}
      <div
        className="absolute left-1/2 bg-black/50"
        style={{ width: 2, top: h * 0.42, bottom: 0, borderRadius: 1, transform: "translateX(-50%)" }}
      />
      {/* металева пружина */}
      <div
        className="absolute left-1/2"
        style={{
          top: h * 0.3,
          width: w + 6,
          height: small ? 6 : 8,
          transform: "translateX(-50%)",
          borderRadius: 9999,
          border: "2px solid #8d949c",
          background: "linear-gradient(180deg,#f1f3f5,#9aa1a9)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── Поява: «повісили» + поштовх ───────────────────────── */
function dropIn(
  els: HTMLElement[],
  { trigger, stagger = 0.12, distance = 60, kick = 30 }: { trigger?: Element | null; stagger?: number; distance?: number; kick?: number }
) {
  const tl = gsap.timeline(
    trigger
      ? { scrollTrigger: { trigger, start: "top 85%", toggleActions: "play none none none" } }
      : {}
  );

  els.forEach((el, i) => {
    tl.fromTo(
      el,
      { opacity: 0, y: -distance },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        force3D: true,
        onStart: () => {
          const dir = i % 2 ? 1 : -1;
          el.querySelector("[data-swing]")?.dispatchEvent(
            new CustomEvent("kick", { detail: dir * (kick + Math.random() * kick * 0.5) })
          );
        },
      },
      i * stagger
    );
  });

  return tl;
}

/* ───────────────────────── Картка-полароїд ───────────────────────── */
export interface PlacePolaroidGridProps {
  Places: Place[];
}

interface PlacePolaroidCardProps {
  item: Place;
}

export function PlacePolaroidCard({ item }: PlacePolaroidCardProps) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swingRef = useRef<HTMLDivElement>(null);

  const kick = useSwing(swingRef, {
    omega: 3 + (seedFrom(item.id) % 5) * 0.1, // у кожної картки трохи інший «період»
    zeta: 0.35,
    seed: seedFrom(item.id),
  });

  const goToPlace = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push("/site/PlacePage/" + item.id);
  };

  const clearLeaveTimeout = () => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
  };

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    clearLeaveTimeout();
    setFlipped(true);
    kick((Math.random() < 0.5 ? -1 : 1) * 16);
  };

  const handleMouseLeave = () => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    clearLeaveTimeout();
    // Невелика затримка гасить "тремтіння" на межі картки
    leaveTimeout.current = setTimeout(() => {
      setFlipped(false);
    }, 120);
  };

  const toggleFlip = () => {
    // На тач-пристроях (без hover) клік перевертає картку
    if (window.matchMedia("(hover: hover)").matches) return;
    setFlipped((prev) => !prev);
    kick((Math.random() < 0.5 ? -1 : 1) * 24);
  };

  // Мишка «штовхає» картку: рух вправо → низ відхиляється вправо (це від'ємний кут у CSS)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    kick(-clamp(e.movementX, -30, 30) * 0.12);
  };

  return (
    <div
      ref={swingRef}
      data-swing
      className="relative w-full"
      style={{ transformOrigin: `50% -${DROP}px`, willChange: "transform" }}
      onPointerMove={handlePointerMove}
    >
      <Clothespin />

      <div
        className="group relative w-full aspect-[3/4] max-h-[520px]"
        style={{ perspective: "1500px" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleFlip}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ================= ЛИЦЕВА СТОРОНА (Полароїд) ================= */}
          <div
            className="absolute inset-0 bg-white rounded-lg shadow-[0_15px_35px_rgba(0,0,0,0.25)] p-3 pb-16 flex flex-col cursor-pointer"
            style={{
              backfaceVisibility: "hidden",
              pointerEvents: flipped ? "none" : "auto",
            }}
          >
            <div className="relative w-full flex-1 overflow-hidden rounded-sm bg-slate-200">
              <Image
                src={item.images[0]}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-16 flex flex-col justify-center px-4">
              <span className="text-[11px] uppercase tracking-widest text-[#0052cc] font-bold">
                {item.type}
              </span>
              <h3
                className="text-slate-900 font-bold text-lg leading-tight truncate"
              >
                {item.title}
              </h3>
            </div>
          </div>

          {/* ================= ЗВОРОТНА СТОРОНА ================= */}
          <div
            className="absolute inset-0 bg-white rounded-lg shadow-[0_15px_35px_rgba(0,0,0,0.25)] p-6 flex flex-col cursor-pointer"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              pointerEvents: flipped ? "auto" : "none",
            }}
          >
            <span className="text-[11px] uppercase tracking-widest text-[#0052cc] font-bold">
              {item.type}
            </span>

            <h3
              className="mt-1 text-slate-900 font-bold text-xl leading-tight"
            >
              {item.title}
            </h3>

            <p className="mt-3 text-slate-700 text-sm leading-relaxed line-clamp-5 flex-1">
              {item.description}
            </p>

            {item.tags && item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-[10px] font-bold uppercase text-[#0052cc] bg-blue-50 border border-blue-200 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={goToPlace}
              className="mt-4 w-full py-3 bg-[#c8102e] hover:bg-[#a30d26] text-white font-bold text-sm rounded-lg transition-colors tracking-wide"
            >
              Дізнатись більше →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Рядок карток на одній мотузці ───────────────────────── */
function PolaroidRow({ items, cols }: { items: Place[]; cols: number }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const sag = cols === 1 ? 14 : 30;
  const width = useRope(rowRef, sag, [cols, items.length]);

  return (
    <div
      ref={rowRef}
      data-row
      className="relative grid gap-10"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      <Rope width={width} sag={sag} />

      {items.map((item, i) => (
        // padding-top для кожної картки виставляє useRope (залежить від провису мотузки)
        <div key={item.id || i} data-hang className="gsap-card relative z-10 opacity-0">
          <PlacePolaroidCard item={item} />
        </div>
      ))}
    </div>
  );
}

function useColumns() {
  const [cols, setCols] = useState(3);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 3 : w >= 640 ? 2 : 1); // ті самі брейкпоінти, що sm / xl у Tailwind
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

/* ───────────────────────── Сітка: рядки на мотузках ───────────────────────── */
export default function PlacePolaroidGrid({ Places }: PlacePolaroidGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cols = useColumns();
  const rows = useMemo(() => chunk(Places ?? [], cols), [Places, cols]);

  useGSAP(
    () => {
      if (!Places || Places.length === 0 || !gridRef.current) return;

      // Кожен рядок «вішається» окремо, коли доскролили до нього
      gridRef.current.querySelectorAll<HTMLElement>("[data-row]").forEach((row) => {
        const cards = Array.from(row.querySelectorAll<HTMLElement>(".gsap-card"));
        dropIn(cards, { trigger: row });
      });
    },
    { scope: gridRef, dependencies: [Places, cols] }
  );

  return (
    <div ref={gridRef} className="flex flex-col gap-20 pt-2">
      {rows.map((row, r) => (
        <PolaroidRow key={`${cols}-${r}`} items={row} cols={cols} />
      ))}
    </div>
  );
}

/* ───────────────────────── Пагінація: номерки на мотузці ───────────────────────── */
function HangingTag({
  label,
  ariaLabel,
  active = false,
  seed,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  active?: boolean;
  seed: number;
  onClick: () => void;
}) {
  const swingRef = useRef<HTMLDivElement>(null);
  // Маленький і легкий → короткий маятник, частіше хитається
  const kick = useSwing(swingRef, { omega: 6.5, zeta: 0.4, seed, maxAngle: 35 });

  return (
    <div data-hang className="page-tag relative z-10 opacity-0">
      <div
        ref={swingRef}
        data-swing
        className="relative"
        style={{ transformOrigin: `50% -${DROP}px`, willChange: "transform" }}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") kick((Math.random() < 0.5 ? -1 : 1) * 14);
        }}
      >
        <Clothespin small />
        <button
          type="button"
          aria-label={ariaLabel}
          aria-current={active ? "page" : undefined}
          onClick={() => {
            kick((Math.random() < 0.5 ? -1 : 1) * 45);
            onClick();
          }}
          className="block w-11 h-14 bg-white rounded-[3px] p-1 pb-3 shadow-[0_8px_16px_rgba(0,0,0,0.25)] cursor-pointer"
        >
          <span
            className="flex w-full h-full items-center justify-center rounded-[2px] font-bold text-sm transition-colors"
            style={{
              background: active ? "#0052cc" : "#e2e8f0",
              color: active ? "#ffffff" : "#334155",
            }}
          >
            {label}
          </span>
        </button>
      </div>
    </div>
  );
}

export function PolaroidPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ropeRef = useRef<HTMLDivElement>(null);
  const sag = 10;
  const width = useRope(ropeRef, sag, [totalPages]);

  useGSAP(
    () => {
      if (!wrapRef.current) return;
      const tags = Array.from(wrapRef.current.querySelectorAll<HTMLElement>(".page-tag"));
      if (!tags.length) return;
      dropIn(tags, { trigger: ropeRef.current, stagger: 0.07, distance: 36, kick: 70 });
    },
    { scope: wrapRef, dependencies: [totalPages] }
  );

  if (totalPages <= 1) return null;

  return (
    <div ref={wrapRef} className="flex justify-center mt-16">
      <div ref={ropeRef} className="relative inline-flex items-start gap-3 px-1 pb-2">
        <Rope width={width} sag={sag} />

        <HangingTag
          label="←"
          ariaLabel="Попередня сторінка"
          seed={1}
          onClick={() => onChange(Math.max(1, page - 1))}
        />

        {Array.from({ length: totalPages }, (_, i) => (
          <HangingTag
            key={i}
            label={String(i + 1)}
            ariaLabel={`Сторінка ${i + 1}`}
            active={page === i + 1}
            seed={i + 2}
            onClick={() => onChange(i + 1)}
          />
        ))}

        <HangingTag
          label="→"
          ariaLabel="Наступна сторінка"
          seed={99}
          onClick={() => onChange(Math.min(totalPages, page + 1))}
        />
      </div>
    </div>
  );
}