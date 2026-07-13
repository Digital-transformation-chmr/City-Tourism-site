'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Place } from "./placeCard";

gsap.registerPlugin(ScrollTrigger);

export interface PlacePolaroidGridProps {
  Places: Place[];
}

interface PlacePolaroidCardProps {
  item: Place;
}

/* ── Одна картка-полароїд з ефектом перевертання ── */
export function PlacePolaroidCard({ item }: PlacePolaroidCardProps) {
  const router = useRouter();
  const [flipped, setFlipped] = useState(false);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
  };

  return (
    <div
      className="gsap-card group relative w-full aspect-[3/4] max-h-[520px] opacity-0"
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
            // Не даємо лицевій стороні ловити події, коли вона повернута "від нас"
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
              style={{ fontFamily: "'Playfair Display', serif" }}
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
            // Поки картка не перевернута — задня сторона не повинна ловити hover
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          <span className="text-[11px] uppercase tracking-widest text-[#0052cc] font-bold">
            {item.type}
          </span>

          <h3
            className="mt-1 text-slate-900 font-bold text-xl leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
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
  );
}

/* ── Сітка карток з появою по черзі ── */
export default function PlacePolaroidGrid({ Places }: PlacePolaroidGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!Places || Places.length === 0) return;

      const cards = gsap.utils.toArray('.gsap-card');

      gsap.fromTo(
        cards,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          force3D: true,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: gridRef, dependencies: [Places] }
  );

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10"
    >
      {Places.map((item, index) => (
        <PlacePolaroidCard key={item.id || index} item={item} />
      ))}
    </div>
  );
}