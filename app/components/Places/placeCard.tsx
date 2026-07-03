'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Реєструємо плагін скролу
gsap.registerPlugin(ScrollTrigger);

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
  phone?: string|any;
  website?: string|any;
  tags: string[];
}

export interface PlaceGrid {
  Places: Place[];
}

interface PlaceCardProps {
  item: Place;
}

{/* Список популярних місць - Окрема картка */}
export function PlaceCard({ item }: PlaceCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLButtonElement>(null);
  const { contextSafe } = useGSAP({ scope: cardRef });

  const handleClick = contextSafe(() => {
    if (cardRef.current) {
      cardRef.current.style.pointerEvents = 'none';
    }

    gsap.to(cardRef.current, {
      scale: 1.2,
      opacity: 0.3,
      duration: 0.1,
      ease: "power1.out",
      force3D: true, // Вмикаємо прискорення GPU для плавного вибухового кліку
      onComplete: () => {
        router.push("/site/PlacePage/" + item.id);
      }
    });
  });

 return (
  <button
    ref={cardRef}
    onClick={handleClick}
    className="
      gsap-card
      group
      relative
       w-full
      aspect-[3/5]
      max-h-[600px]
      overflow-hidden
      rounded-xl
      text-left
      opacity-0
      border border-white/10
      bg-black
      will-change-transform
    "
  >
    {/* Фото */}
    <Image
      src={item.images[0]}
      alt={item.title}
      fill
      className="
        object-cover
        transition-transform
        duration-700
        group-hover:scale-110
      "
    />

    {/* Верхній легкий градієнт */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

    {/* Hover градієнт */}
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-t
        from-black
        via-black/70
        to-transparent
        opacity-0
        transition-all
        duration-500
        group-hover:opacity-100
      "
    />

    {/* Контент */}
    <div
      className="
        absolute
        bottom-0
        left-0
        right-0
        p-8
        flex
        flex-col
      "
    >
      <span className="text-lg text-lime-300 uppercase tracking-widest">
        {item.type}
      </span>

      <h3 className="mt-2 text-4xl font-bold text-white">
        {item.title}
      </h3>

      {item.subtitle && (
        <p className="mt-2 text-lg text-white/70">
          {item.subtitle}
        </p>
      )}

      {/* Те що показується тільки при hover */}
      <div
        className="
          overflow-hidden
          max-h-0
          opacity-0
          translate-y-5
          transition-all
          duration-500
          group-hover:max-h-60
          group-hover:opacity-100
          group-hover:translate-y-0
        "
      >
      <p className="mt-6 text-white/90 leading-relaxed line-clamp-4 text-lg">
        {item.description}
      </p>

        <div className="mt-6 flex items-center gap-2 text-lime-300 font-medium">
          Детальніше
          <span className="transition-transform duration-300 group-hover:translate-x-2">
            →
          </span>
        </div>
      </div>
    </div>
  </button>
);
}

{/* Компонент сітки з плавною появою карток по черзі */}
export default function PopPlaceGrid({ Places }: PlaceGrid) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Якщо дані з API ще не прийшли — чекаємо
    if (!Places || Places.length === 0) return;

    const cards = gsap.utils.toArray('.gsap-card');

    gsap.fromTo(cards, 
      { 
        opacity: 0, 
        y: 50 
      }, 
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15, // Плавна поява одна за одною
        ease: "power2.out",
        force3D: true, // Оптимізація для скролу без мікрофризів
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%", 
          toggleActions: "play none none none" 
        }
      }
    );
  }, { 
    scope: gridRef, 
    dependencies: [Places] // Перезапуск тригерів одразу після завантаження місць
  });

  return (
    <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-18">
      {Places.map((item, index) => (
        <PlaceCard key={item.id || index} item={item} />
      ))}
    </div>
  );
}