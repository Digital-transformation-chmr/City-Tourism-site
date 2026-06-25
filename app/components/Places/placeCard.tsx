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
      scale: 2,
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
        flex flex-col
        overflow-hidden
        rounded-2xl
        text-left
        w-full
        opacity-0
        
        /* Оптимізація рендерингу для відеокарти */
        will-change-[transform,opacity]
    
        border border-white/10
        bg-black/40
        backdrop-blur-md
        shadow-lg
        
        /* ВИПРАВЛЕНО: Анімуємо тільки бордер і тінь, не конфліктуємо з GSAP */
        transition-[border-color,box-shadow]
        duration-300
        hover:border-white/20
        hover:shadow-2xl
      "
    >
      <div className="relative w-full">
        <Image
          alt={item.title}
          src={item.images[0]}
          width={300}
          height={400}
          className="
            h-65
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />
        {/* Градієнтне затемнення знизу, щоб картка виглядала об'ємно і читався текст */}
        <div className="absolute inset-0 bg-black/20 to-transparent" />
        
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-sm text-(--text-light) backdrop-blur-md">
          {item.type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 w-full">
        <h3 className="mb-2 text-lg font-semibold text-(--text-light)">
          {item.title}
        </h3>
        <p className="line-clamp-3 text-sm text-(--text-light)">
          {item.description}
        </p>
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-2 text-m font-medium text-lime-300">
            Детальніше
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </span>
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