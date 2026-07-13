'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, AnimatePresence, type PanInfo } from "motion/react";
import { Place } from "./placeCard";

const LOOP_THRESHOLD = 6; // менше цієї кількості — без луп-дублювання

/* ── Одна бирка ключа на гачку ── */
function KeyTag({ place, onOpen }: { place: Place; onOpen: (p: Place) => void }) {
  const y = useMotionValue(0);
  const [delay] = useState(() => Math.random() * 3);
  const [duration] = useState(() => 3.5 + Math.random() * 2);
  const dragStartY = useRef(0);
  const wasDragged = useRef(false);

  const handleDragStart = () => {
    wasDragged.current = false;
    dragStartY.current = y.get();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 6) wasDragged.current = true;
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const torn = info.offset.y > 55 || info.velocity.y > 450;
    y.set(0);
    if (torn) onOpen(place);
  };

  const handleClick = () => {
    // Клік спрацьовує тільки якщо не було суттєвого драгу
    if (!wasDragged.current) onOpen(place);
  };

  return (
    <div className="relative flex flex-col items-center shrink-0" style={{ width: 190 }}>
      {/* Гачок на дошці */}
      <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#d8dadd] to-[#8a8f98] border-2 border-[#5c6067] shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-10" />

      {/* Маятникове гойдання (ідле-анімація) */}
      <div
        className="origin-top"
        style={{ animation: `key-swing ${duration}s ease-in-out ${delay}s infinite alternate` }}
      >
        <div className="w-[3px] h-14 bg-gradient-to-b from-[#5c6067] to-[#3d4147] mx-auto shadow-sm" />

        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 130 }}
          dragElastic={0.15}
          dragTransition={{ bounceStiffness: 320, bounceDamping: 22 }}
          style={{ y }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onClick={handleClick}
          whileHover={{ scale: 1.04, rotate: 0 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          <div
            className="relative w-[160px] rounded-xl bg-gradient-to-b from-[#e8c988] via-[#d4a94f] to-[#a87f2e] p-3 border border-[#8a6a2c]/60"
            style={{ boxShadow: "0 14px 28px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4)" }}
          >
            <div className="rounded-lg overflow-hidden bg-black/20 aspect-[4/3] mb-2.5 shadow-inner">
              {place.images?.[0] && (
                <img
                  src={place.images[0]}
                  alt={place.title}
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              )}
            </div>
            <div className="text-center">
              <div className="text-[9px] tracking-widest uppercase text-black/45 font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
                Номер
              </div>
              <div
                className="text-[15px] font-bold text-black/85 truncate"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {place.title}
              </div>
            </div>
            {/* Отвір для кільця бирки */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-[3px] border-[#8a6a2c] bg-[#efe5d3]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Дошка ключів (loop або elastic-scroll залежно від кількості) ── */
export function KeyBoard({ places, onOpen }: { places: Place[]; onOpen: (p: Place) => void }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ containerW: 0, contentW: 0 });

  const isLoop = places.length >= LOOP_THRESHOLD;
  const renderList = isLoop ? [...places, ...places] : places;

  // Точний вимір розмірів дошки та треку, з реакцією на resize/зміну даних
  useEffect(() => {
    if (!outerRef.current || !trackRef.current) return;

    const measure = () => {
      const containerW = outerRef.current!.clientWidth;
      const fullW = trackRef.current!.scrollWidth;
      const contentW = isLoop ? fullW / 2 : fullW;
      setBounds({ containerW, contentW });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outerRef.current);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [places, isLoop]);

  // Безшовний нескінченний wrap — тільки в loop-режимі
  useEffect(() => {
    if (!isLoop || !bounds.contentW) return;
    const unsub = x.on("change", (latest) => {
      const w = bounds.contentW;
      if (latest < -w) x.set(latest + w);
      else if (latest > 0) x.set(latest - w);
    });
    return unsub;
  }, [x, isLoop, bounds.contentW]);

  // Скидаємо позицію при зміні набору даних/режиму, щоб не "застрягти" за межами
  useEffect(() => {
    x.set(0);
  }, [places.length, isLoop, x]);

  if (!places.length) return null;

  const scrollConstraints = isLoop
    ? undefined
    : {
        left: Math.min(0, bounds.containerW - bounds.contentW - 24),
        right: 0,
      };

  return (
    <div ref={outerRef} className="relative w-full overflow-hidden select-none" style={{ minHeight: 360 }}>
      {/* Дерев'яна дошка */}
      <div
        className="absolute top-0 left-0 right-0 h-4 z-0"
        style={{
          background: "linear-gradient(180deg, #8a6338, #5c3e24)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
        }}
      />
      <div
        className="absolute top-4 left-0 right-0 bottom-0 z-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(0,0,0,0.07) 0px, rgba(0,0,0,0.07) 2px, transparent 2px, transparent 130px), linear-gradient(180deg, #cbA877, #b08a52 60%, #9c7642)",
          boxShadow: "inset 0 10px 25px rgba(0,0,0,0.25), inset 0 -6px 16px rgba(0,0,0,0.2)",
        }}
      />

      <motion.div
        ref={trackRef}
        className="relative flex gap-9 pt-7 pl-8 pb-6 w-max cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={scrollConstraints}
        dragMomentum
        dragElastic={isLoop ? 0 : 0.06}
        dragTransition={{ power: 0.35, timeConstant: 260 }}
        style={{ x }}
      >
        {renderList.map((place, i) => (
          <KeyTag key={`${place.id}-${i}`} place={place} onOpen={onOpen} />
        ))}
      </motion.div>
    </div>
  );
}

/* ── Картка номера, що відкривається знизу ── */
export function RoomModal({ place, onClose }: { place: Place | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {place && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="relative aspect-[16/10] bg-slate-200">
              {place.images?.[0] && (
                <img src={place.images[0]} alt={place.title} className="w-full h-full object-cover" />
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <span className="text-xs uppercase tracking-widest text-[#0052cc] font-bold">{place.type}</span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                {place.title}
              </h2>
              {place.address && <p className="mt-2 text-sm text-slate-500">{place.address}</p>}
              {place.description && (
                <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-5">{place.description}</p>
              )}
            <a    
                href={"/site/PlacePage/" + place.id}
                className="mt-6 block w-full text-center py-3.5 bg-[#c8102e] hover:bg-[#a30d26] text-white font-bold rounded-xl transition-colors tracking-wide text-sm"
                style={{ fontFamily: "'Space Mono', monospace" }}
              >
                Забронювати номер →
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}