"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PopPlaceGrid from "../components/Places/placeCard";
import WeatherCity from "../components/UI/weather";
import { Utensils, Drama, TreePine } from "lucide-react";
import NewsGrid from "../components/News/newsCards";
import { Place } from "../components/Places/placeCard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [news, setNews] = useState<any[]>([]);

  // Головний контейнер-обгортка для безпечного пошуку селекторів через useGSAP
  const mainRef = useRef<HTMLDivElement>(null);
  
  const heroTextRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Завантаження пам'яток
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const featuredPlaceIds = [1,2,3,4,5];
        const res = await fetch("/api/places");

        if (!res.ok) {
          throw new Error("Помилка завантаження місць");
        }

        const allPlaces = await res.json();
        const selectedPlaces = featuredPlaceIds
          .map((id) => allPlaces.find((place: Place & { id: number }) => place.id === id))
          .filter(Boolean);

        setPlaces(selectedPlaces);
      } catch (err) {
        console.error(err);
      }
    };

    loadPlaces();
  }, []);

// Завантаження новин (додайте це всередину компонента Home)
  useEffect(() => {
    fetch("/api/news")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Помилка завантаження новин з сервера");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setNews(data); // Тут уже буде рівно 4 найсвіжіші новини
        }
      })
      .catch((err) => console.error("Помилка під час запиту новин:", err));
  }, []);

  // Усі анімації сторінки в одному місці з правильним scope
  useGSAP(() => {
    // 1. Анімація для першого банера при завантаженні
    gsap.from(heroTextRef.current, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      delay: 0.2,
      ease: "power4.out",
      force3D: true,
    });

    // 2. Анімація виїзду заголовка секції "ТОП Пам'ятки" при скролі
  gsap.fromTo(triggerRef.current, 
  {
      x: "-100%",          // Початковий стан: блок схований зліва
      opacity: 0,
    },
    {
      x: "0%",             // Фінальний стан: блок повністю на екрані
      opacity: 1,
      duration: 0.8, 
      ease: "power3.out",
      force3D: true,
      scrollTrigger: {
        trigger: triggerRef.current,
        
        // Починає з'являтися, коли верх блоку перетинає 85% висоти екрана (рух вниз)
        start: "top 85%", 
        
        // Кінцева точка для фіксації зони (можна поставити стандартно)
        end: "bottom 20%",
        
        // НАЛАШТУВАННЯ ПОВЕДІНКИ:
        // play — коли скролиш вниз і блок заходить на екран (показуємо)
        // none — коли скролиш далі вниз і блок виходить вгору (він залишається видимим)
        // none — коли повертаєшся зверху вниз (нічого не робимо, він уже видимий)
        // reverse — ЕФЕКТ UNDO: коли скролиш вгору і блок остаточно покидає екран знизу (ховаємо назад вліво)
        toggleActions: "play none none reverse", 
      }
    }
  );
  }, { scope: mainRef }); // Тепер scope покриває всю сторінку і бачить обидва рефи!

  return (
    <div ref={mainRef} className="overflow-x-hidden"> {/* Запобігає появі горизонтального скролу при виїзді блоків */}
      
      {/* Перший банер */}
      <div className="h-screen w-full flex items-center justify-center relative bg-black/50 text-white">
        <Image
          alt="Hero"
          src="/Banners/banner1.jpg"
          fill
          className="object-cover -z-10"
          priority
        />

        <div ref={heroTextRef} className="will-change-transform">
          <p className="text-6xl text-center">
            Відчуйте магію
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">
              живого міста
            </span>
          </p>
        </div>

        <div className="absolute bottom-6 flex justify-center w-full">
          <div className="animate-bounce text-white/30 text-sm">▼</div>
        </div>

        <div className="absolute top-16 right-6 z-10">
          <WeatherCity />
        </div>
      </div>

      {/* Заголовок секції */}
      <div 
        ref={triggerRef} 
        className="relative overflow-hidden bg-black/20 will-change-transform"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent)] opacity-80" />

        <div className="py-16 px-12 flex flex-col items-start">
          <span className="text-sm tracking-[0.25em] uppercase font-bold text-[var(--accent)] flex items-center gap-3 mb-4">
            <span className="inline-block w-8 h-px bg-[var(--accent)]" />
            ТОП
          </span>

          <h1 className="text-5xl sm:text-6xl font-bold text-[var(--text-light)] leading-tight max-w-xl">
            Пам'ятки
            <span className="italic text-[var(--accent)]"> міста</span>
          </h1>

          <p className="mt-4 text-[var(--gray-text)] text-lg max-w-md leading-relaxed">
            Відкрийте найкращі місця, що зберігають дух і душу міста
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-px bg-[var(--accent)] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80" />
            <div className="w-4 h-px bg-[var(--accent)] opacity-40" />
          </div>
        </div>
      </div>

      {/* Карточки */}
      <div className="my-8 mx-2 px-10 py-4">
        <PopPlaceGrid Places={places} />
      </div>

      {/* Другий hero — інший стиль */}
      <div className="h-screen w-full flex flex-col items-center justify-center relative bg-black/60 text-white px-8">
        <Image
          alt="Hero2"
          src="/Banners/banner2.jpg"
          fill
          className="object-cover -z-10"
        />

        <h2 className="text-5xl font-bold mb-6 text-center">
          Відкрийте <span className="text-[var(--accent)]">атмосферу</span> міста
        </h2>
        <p className="text-2xl max-w-2xl text-center text-white/80 leading-relaxed">
          Тут кожна вулиця має свою історію, кожна пам’ятка — свою legenda.
          Досліджуйте, відкривайте і закохуйтесь у місто знову і знову.
        </p>
      </div>

      {/* Нова секція після другого hero */}
      <div className="bg-white/10 py-20 px-12 text-center">
        <h2 className="text-4xl font-bold text-[var(--accent)] mb-12">
          Що вас чекає?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-6xl mx-auto">
          
          {/* Гастрономія */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 will-change-transform transition-[transform,box-shadow] hover:-translate-y-2 hover:shadow-black/40 duration-300">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-red-400 shadow-lg">
              <Utensils color="#fff"/>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--accent)]">ГАСТРОНОМІЯ</h3>
            <p className="text-white/80 text-2xl leading-relaxed">
              Скуштуйте найкращі страви місцевої кухні.
            </p>
          </div>

          {/* Культура */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 will-change-transform transition-[transform,box-shadow] hover:-translate-y-2 hover:shadow-black/40 duration-300">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 shadow-lg">
              <Drama color="#fff"/>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--accent)]">КУЛЬТУРА</h3>
            <p className="text-white/80 text-2xl leading-relaxed">
              Виставки, театри та фестивалі для кожного.
            </p>
          </div>

          {/* Природа */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 will-change-transform transition-[transform,box-shadow] hover:-translate-y-2 hover:shadow-black/40 duration-300">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-teal-400 shadow-lg">
              <TreePine color="#fff"/>
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-[var(--accent)]">ПРИРОДА</h3>
            <p className="text-white/80 text-2xl leading-relaxed">
              Прогулянки вздовж Дніпра та зелені парки.
            </p>
          </div>
        </div>
      </div>

      {/* Третій hero */}
      <div className="h-screen w-full flex items-center relative justify-center bg-black/50 text-white">
        <Image
          alt="Hero3"
          src="/Banners/banner3.png"
          fill
          className="object-cover -z-10"
        />

        <p className="text-6xl text-center">
          Сплануйте свою подорож
          <br />
          <span className="bg-gradient-to-r from-blue-300 to-red-300 bg-clip-text text-transparent">
            прямо зараз
          </span>
        </p>
      </div>

      <div className="py-20 px-12 bg-black/20">
        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Останні новини
        </h2>
        
        {news.length > 0 ? (
          <NewsGrid items={news} /> // <--- ПЕРЕДАЄМО НАПРЯМУ МАСИВ NEWS
        ) : (
          <p className="text-center text-white/50 text-xl">Новин поки немає...</p>
        )}
      </div>

    </div>
  );
}