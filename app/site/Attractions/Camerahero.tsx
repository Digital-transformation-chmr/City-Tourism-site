'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Info,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { Place } from "@/app/components/Places/placeCard";

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
  if (Array.isArray(place.images) && place.images.length) {
    return place.images;
  }
  return [];
}

function DiamondSVG({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="white"
      style={{ position: "absolute", ...style }}
    >
      <path d="M 50,1 Q 50,50 99,50 Q 50,50 50,99 Q 50,50 1,50 Q 50,50 50,1 Z" />
    </svg>
  );
}

function MiniFlash() {
  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-white"
        style={{
          animation: "mini-white 0.35s ease-out forwards",
        }}
      />

      <DiamondSVG
        style={{
          width: "30vmin",
          height: "30vmin",
          top: "50%",
          left: "50%",
          marginTop: "-15vmin",
          marginLeft: "-15vmin",
          animation: "mini-burst 0.35s ease-out forwards",
          filter: "drop-shadow(0 0 20px white)",
          zIndex: 1,
        }}
      />
    </div>
  );
}

function CanonCamera({
  imageUrl,
  onPrev,
  onNext,
}: {
  imageUrl?: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Корпус камери */}
      <div
        className="relative select-none w-full aspect-[3/2] bg-[#1a1a1a] rounded-[24px] p-2 sm:p-6 flex items-center justify-between border-b-8 border-black/40"
        style={{
          boxShadow:
            "inset 0 4px 10px rgba(255,255,255,0.1), 0 30px 60px rgba(0,0,0,0.5)",
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "4px 4px",
        }}
      >
        {/* Видошукач */}
        <div className="absolute -top-[12px] left-1/2 -translate-x-1/2 w-[28%] h-[16px] bg-[#121212] border border-black rounded-t-lg shadow-md z-0 flex items-center justify-center">
          <div className="w-[85%] h-[4px] bg-red-600/30 rounded-full blur-[1px]" />
        </div>

        {/* Екран камери */}
        <div className="relative flex-1 h-full bg-black rounded-lg overflow-hidden border-[6px] border-[#121212] shadow-inner group">
          <AnimatePresence mode="wait">
            {imageUrl && (
              <motion.img
                key={imageUrl}
                src={imageUrl}
                alt="Live View"
                className="w-full h-full object-cover absolute inset-0"
                initial={{
                  opacity: 0,
                  filter: "brightness(3) blur(10px)",
                }}
                animate={{
                  opacity: 1,
                  filter: "brightness(1) blur(0px)",
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                }}
              />
            )}
          </AnimatePresence>

          {/* Екранний фільтр */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none z-10" />

          {/* Інтерфейс дисплея */}
          <div className="absolute inset-0 p-3 flex flex-col justify-between text-white  text-[10px] sm:text-xs z-20 pointer-events-none select-none tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
        </div>

        {/* Фізичні кнопки */}
        <div className="w-[60px] sm:w-[80px] h-full flex flex-col justify-between items-center pl-3 sm:pl-4 py-2 z-10 border-l border-white/5">
          <div className="flex flex-col items-center gap-1">
            <a
              href="#Pin-1"
              className="w-7 h-7 bg-[#262626] border border-black rounded-full shadow flex items-center justify-center text-[8px] text-white/40 font-bold"
            >
              MENU
            </a>
          </div>

          {/* Навігація */}
          <div className="flex flex-col gap-3 my-auto items-center">
            <button
              onClick={onPrev}
              aria-label="Попередня пам'ятка"
              className="w-10 h-10 bg-[#222] hover:bg-[#2a2a2a] active:bg-[#151515] text-white/80 hover:text-white rounded-full flex items-center justify-center border border-black transition-all shadow-md group/btn"
              style={{
                boxShadow:
                  "inset 0 1px 3px rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              <ChevronLeft
                size={20}
                className="transition-transform group-hover/btn:-translate-x-0.5"
              />
            </button>

            <button
              onClick={onNext}
              aria-label="Наступна пам'ятка"
              className="w-10 h-10 bg-[#222] hover:bg-[#2a2a2a] active:bg-[#151515] text-white/80 hover:text-white rounded-full flex items-center justify-center border border-black transition-all shadow-md group/btn"
              style={{
                boxShadow:
                  "inset 0 1px 3px rgba(255,255,255,0.1), 0 4px 6px rgba(0,0,0,0.3)",
              }}
            >
              <ChevronRight
                size={20}
                className="transition-transform group-hover/btn:translate-x-0.5"
              />
            </button>
          </div>

          {/* Індикатор галереї */}
          <div className="w-7 h-5 bg-[#262626] border border-black rounded flex items-center justify-center">
            <div className="w-3 h-2.5 border border-white/30 rounded-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ЛІВА ПАНЕЛЬ ──
function LeftSidebar({
  place,
  visible,
  current,
  total,
  isMobile,
}: {
  place: Place;
  visible: boolean;
  current: number;
  total: number;
  isMobile: boolean;
}) {
  return (
    <motion.div
      animate={
        isMobile
          ? { y: visible ? 0 : 20, opacity: visible ? 1 : 0 }
          : { x: visible ? 0 : "-115%", opacity: 1 }
      }
      initial={isMobile ? { y: 20, opacity: 0 } : { x: "-115%" }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 240,
      }}
      className={
        isMobile
          ? "w-full"
          : "absolute left-0 top-0 bottom-0 z-20 flex flex-col justify-center"
      }
      style={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH_DESKTOP,
        padding: isMobile ? "24px 20px" : "0 clamp(24px, 2.5vw, 36px)",
        background: "color-mix(in srgb, var(--bg-gradient) 95%, black)",
        borderLeft: !isMobile ? "4px solid var(--accent)" : undefined,
        borderRight: !isMobile
          ? "1px solid rgba(0, 0, 0, 0.05)"
          : undefined,
        borderRadius: isMobile ? "20px" : "0",
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#0052cc] text-xs sm:text-sm font-bold tracking-widest uppercase">
            {place?.type ?? "Пам'ятка"}
          </span>

          <span
            className="text-slate-500 text-lg font-semibold"
          >
            {String(current + 1).padStart(2, "0")}/
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <h1
          className="text-slate-900 leading-tight font-bold text-2xl sm:text-3xl md:text-4xl"
        >
          {place?.title ?? "—"}
        </h1>

        {place?.yearBuilt && (
          <div>
            <div
              className="text-slate-500/80 text-xs tracking-wider uppercase font-bold mb-1"
            >
              Рік спорудження
            </div>

            <div
              className="text-[#c8102e] text-lg sm:text-xl font-bold"
            >
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
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                background:
                  i === current
                    ? "#0052cc"
                    : "rgba(148,163,184,0.4)",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── ПРАВА ПАНЕЛЬ ──
function RightSidebar({
  place,
  visible,
  isMobile,
}: {
  place: Place;
  visible: boolean;
  isMobile: boolean;
}) {
  return (
    <motion.div
      animate={
        isMobile
          ? { y: visible ? 0 : 20, opacity: visible ? 1 : 0 }
          : { x: visible ? 0 : "115%", opacity: 1 }
      }
      initial={isMobile ? { y: 20, opacity: 0 } : { x: "115%" }}
      transition={{
        type: "spring",
        damping: 24,
        stiffness: 240,
      }}
      className={
        isMobile
          ? "w-full mb-5"
          : "absolute right-0 top-0 bottom-0 z-20 flex flex-col justify-center"
      }
      style={{
        width: isMobile ? "100%" : SIDEBAR_WIDTH_DESKTOP,
        background: "color-mix(in srgb, var(--bg-gradient) 95%, black)",
        padding: isMobile ? "24px 20px" : "0 clamp(24px, 2.5vw, 36px)",
        borderLeft: !isMobile
          ? "1px solid rgba(0, 0, 0, 0.05)"
          : undefined,
        border: isMobile
          ? "1px solid rgba(255, 255, 255, 0.2)"
          : undefined,
        borderRadius: isMobile ? "20px" : "0",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex flex-col gap-6">
        <div
          className="text-slate-500/80 text-xs tracking-wider uppercase font-bold"
        >
          Деталі
        </div>

        <div className="flex flex-col gap-5">
          {place?.address && (
            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                className="shrink-0 mt-0.5 text-[#c8102e]"
              />

              <div>
                <div
                  className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5"
                >
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
              <Clock
                size={18}
                className="shrink-0 mt-0.5 text-[#0052cc]"
              />

              <div>
                <div
                  className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5"
                >
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
              <Info
                size={18}
                className="shrink-0 mt-0.5 text-amber-600"
              />

              <div>
                <div
                  className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5"
                >
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
              <Globe
                size={18}
                className="shrink-0 mt-0.5 text-emerald-600"
              />

              <div>
                <div
                  className="text-slate-500/80 text-[11px] tracking-wider uppercase font-bold mb-0.5"
                >
                  Вебсайт
                </div>

                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base font-semibold break-all"
                >
                  {place.website.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="h-px w-full bg-gradient-to-l from-slate-300/50 to-transparent" />

        <a
          href={"/site/PlacePage/" + place.id}
          className="w-full text-center py-3.5 transition-all duration-200 bg-white/40 hover:bg-[#c8102e] text-[#c8102e] hover:text-white active:scale-[0.98] rounded-xl font-bold border border-[#c8102e]/30 hover:border-transparent text-sm shadow-sm"
          style={{
            letterSpacing: "0.1em",
          }}
        >
          Дізнатись Більше →
        </a>
      </div>
    </motion.div>
  );
}

// ── HERO ──
export default function CameraHero({ places }: { places: Place[] }) {
  const [current, setCurrent] = useState(0);
  const [miniFlash, setMiniFlash] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [photoShown, setPhotoShown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setCurrent(0);
  }, [places]);

  // Прискорене інтро:
  // камера → спалах → фотографія → інформаційні панелі
  useEffect(() => {
    const t1 = setTimeout(() => {
      setMiniFlash(true);
      setFlashKey((k) => k + 1);
    }, 850);

    const t2 = setTimeout(() => {
      setPhotoShown(true);
    }, 950);

    const t3 = setTimeout(() => {
      setMiniFlash(false);
    }, 1250);

    const t4 = setTimeout(() => {
      setSidebarVisible(true);
    }, 1300);

    return () => {
      [t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (!places.length || !photoShown) return;

      setSidebarVisible(false);
      setMiniFlash(true);
      setFlashKey((k) => k + 1);

      setTimeout(() => {
        setCurrent((p) => (p + dir + places.length) % places.length);
        setMiniFlash(false);

        setTimeout(() => {
          setSidebarVisible(true);
        }, 50);
      }, 350);
    },
    [places.length, photoShown]
  );

  const place = places[current];

  const rawImage = useMemo(
    () => getImages(place)[0],
    [place]
  );

  const imageUrl = photoShown ? rawImage : undefined;

  return (
    <section
      className="relative min-h-screen md:h-screen w-full overflow-hidden flex flex-col justify-center items-center"
      style={{
        paddingLeft: isMobile ? "16px" : SIDEBAR_WIDTH_DESKTOP,
        paddingRight: isMobile ? "16px" : SIDEBAR_WIDTH_DESKTOP,
        paddingTop: isMobile ? "40px" : "0px",
        paddingBottom: isMobile ? "40px" : "0px",
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Фонове зображення */}
      {imageUrl ? (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            className="object-cover transition-all duration-700 ease-in-out"
            style={{
              filter: "blur(30px) brightness(0.94) saturate(1.1)",
              transform: "scale(1.06)",
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-200" />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.2) 20%, rgba(241,245,249,0.75) 100%)",
        }}
      />

      {miniFlash && <MiniFlash key={flashKey} />}

      {/* Камера з'являється знизу */}
      <div className="relative z-10 w-full flex justify-center items-center my-auto px-2">
        <motion.div
          className="w-full"
          initial={{
            y: 320,
            rotate: -14,
            scale: 0.65,
            opacity: 0,
          }}
          animate={{
            y: [320, -14, 0],
            rotate: [-14, 3, 0],
            scale: [0.65, 1.03, 1],
            opacity: [0, 1, 1],
          }}
          transition={{
            duration: 0.55,
            times: [0, 0.7, 1],
            ease: "easeOut",
          }}
        >
          <CanonCamera
            imageUrl={imageUrl}
            onPrev={() => navigate(-1)}
            onNext={() => navigate(1)}
          />
        </motion.div>
      </div>

      {/* Інформаційні панелі */}
      {place && (
        <>
          {isMobile ? (
            <div className="w-full z-10 flex flex-col gap-5 mt-8">
              <LeftSidebar
                place={place}
                visible={sidebarVisible}
                current={current}
                total={places.length}
                isMobile={true}
              />

              <RightSidebar
                place={place}
                visible={sidebarVisible}
                isMobile={true}
              />
            </div>
          ) : (
            <>
              <LeftSidebar
                place={place}
                visible={sidebarVisible}
                current={current}
                total={places.length}
                isMobile={false}
              />

              <RightSidebar
                place={place}
                visible={sidebarVisible}
                isMobile={false}
              />
            </>
          )}
        </>
      )}

      {/* Стрілка внизу */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.45, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.35,
        }}
        className="absolute pt-0 bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white font-medium text-xs tracking-wider select-none pointer-events-none uppercase"
      >
        <span className="pt-3">Більше</span>

        <motion.svg
          animate={{ y: [0, 6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut",
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
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
