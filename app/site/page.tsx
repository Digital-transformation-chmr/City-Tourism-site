"use client";

import PopPlaceGrid from "../components/Places/placeCard";
import WeatherCity from "../components/UI/weather";
import { useEffect, useRef, useState } from "react";
import { Utensils, Drama, TreePine } from "lucide-react";
import NewsGrid from "../components/News/newsCards";
import { Place } from "../components/Places/placeCard";
import Particles from "@/components/Particles";
import gsap from "gsap";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { motion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "ЧЕРКАСИ".split("");

const ease = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [news, setNews] = useState<any[]>([]);

  const [heroReady, setHeroReady] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // LOAD PLACES
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const featuredPlaceIds = [1, 2, 3, 4, 5];
        const res = await fetch("/api/places");

        if (!res.ok) throw new Error("Помилка завантаження місць");

        const allPlaces = await res.json();

        const selectedPlaces = featuredPlaceIds
          .map((id) =>
            allPlaces.find((place: Place & { id: number }) => place.id === id)
          )
          .filter(Boolean);

        setPlaces(selectedPlaces);
      } catch (err) {
        console.error(err);
      }
    };

    loadPlaces();
  }, []);

  // LOAD NEWS
  useEffect(() => {
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNews(data);
      })
      .catch(console.error);
  }, []);

  // GSAP
  useGSAP(
    () => {
      gsap.from(heroTextRef.current, {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      });

      gsap.fromTo(
        triggerRef.current,
        { x: "-100%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top 85%",
          },
        }
      );
    },
    { scope: mainRef }
  );

return (
    <div ref={mainRef} className="overflow-x-hidden">

      {/* ================= HERO 1 (NEW MOTION VERSION) ================= */}
      <div className="relative h-screen overflow-hidden bg-[#080a0f] text-white">

        {/* Background image with cinematic reveal */}
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "circle(0% at 50% 45%)" }}
          animate={
            heroReady
              ? { clipPath: "circle(160% at 50% 45%)" }
              : {}
          }
          transition={{
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >

          <Image
            src="/Banners/banner1.jpeg"
            alt="Hero"
            fill
            priority
            className="object-cover"
            style={{
              animation: "slowZoom 20s ease-out forwards",
            }}
          />
        <Particles
          particleColors={["#ffffff"]}
          particleCount={400}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={200}
          moveParticlesOnHover={false}
          alphaParticles
          disableRotation={false}
          pixelRatio={1}
      />
          {/* cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-[#080a0f]/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-[#13284f]/10 mix-blend-color" />
        </motion.div>

        {/* grain */}
        <svg className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay pointer-events-none">
          <filter id="grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        {/* Weather */}
        <div className="absolute right-6 top-16 z-20">
          <WeatherCity />
        </div>

        {/* Coordinates */}
        <motion.div
          className="absolute left-8 top-10 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={heroReady ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 1.6 }}
        >
          <p className="text-xs tracking-[0.35em] uppercase text-white/40">
            Черкаська область
          </p>
        </motion.div>

        {/* ================= CENTER TITLE ================= */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center">

          <div className="flex overflow-hidden">
            {TITLE.map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={
                  heroReady
                    ? { y: 0, opacity: 1 }
                    : {}
                }
                transition={{
                  delay: 0.75 + i * 0.07,
                  duration: 0.8,
                  ease,
                }}
                className="font-black select-none"
                style={{
                  fontFamily: "Unbounded",
                  fontSize: "clamp(3.5rem, 14vw, 13rem)",
                  lineHeight: 0.9,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>

          {/* underline */}
          <motion.div
            className="mt-5 h-px w-72 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={heroReady ? { scaleX: 1, opacity: 1 } : {}}
            transition={{ delay: 1.4 }}
          />

          {/* subtitle */}
          <motion.p
            className="mt-6 uppercase tracking-[0.45em] text-white/60 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={heroReady ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 1.6 }}
          >
            Відчуйте магію живого міста
          </motion.p>

          {/* CTA */}
          <motion.div
            className="mt-10 flex gap-5"
            initial={{ y: 20, opacity: 0 }}
            animate={heroReady ? { y: 0, opacity: 1 } : {}}
            transition={{ delay: 1.9 }}
          >
            <a href="/site/Attractions" className="bg-[var(--accentLO)] text-black px-8 py-3 uppercase text-xs tracking-[0.2em] hover:scale-105 transition">
              Досліджувати
            </a>

            <a href="/site/InteractiveMap" className="border border-white/30 px-8 py-3 uppercase text-xs tracking-[0.2em] hover:border-[var(--accent)] transition">
              Маршрути
            </a>
          </motion.div>

        </div>


        {/* scroll indicator */}
        <div className="absolute bottom-5 w-full flex justify-center">
          <div className="animate-bounce text-white/40">▼</div>
        </div>

      </div>

      {/* ================= END HERO 1 ================= */}

      
            {/* ================= TOP SECTION ================= */}
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
            Куди піти в{" "}
            <span className="italic text-[var(--accent)]">першу</span> чергу
          </h1>

          <p className="mt-4 text-[var(--gray-text)] text-2xl max-w-md leading-relaxed">
            Відкрийте найкращі місця, що зберігають дух і душу міста
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="w-12 h-px bg-[var(--accent)] opacity-60" />
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-80" />
            <div className="w-4 h-px bg-[var(--accent)] opacity-40" />
          </div>
        </div>
      </div>

      {/* ================= POP PLACES GRID ================= */}
      <div className="my-8 mx-2 px-10 py-4">
        <PopPlaceGrid Places={places} />
      </div>

            {/* ================= HERO 2 ================= */}
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
          Тут кожна вулиця має свою історію, кожна пам’ятка — свою легенду.
          Досліджуйте, відкривайте і закохуйтесь у місто знову і знову.
        </p>

      </div>

            {/* ================= FEATURES ================= */}
      <div className="bg-white/10 py-20 px-12 text-center">

        <h2 className="text-4xl font-bold text-[var(--accent)] mb-12">
          Що вас чекає?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-15 max-w-7xl mx-auto">

          {/* FOOD */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 hover:-translate-y-2 transition">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-400 to-red-400">
              <Utensils color="#fff" />
            </div>
            <h3 className="text-3xl font-semibold mb-4 text-[var(--accent)]">
              ГАСТРОНОМІЯ
            </h3>
            <p className="text-white/80 text-2xl">
              Скуштуйте найкращі страви місцевої кухні.
            </p>
          </div>

          {/* CULTURE */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 hover:-translate-y-2 transition">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-indigo-400">
              <Drama color="#fff" />
            </div>
            <h3 className="text-3xl font-semibold mb-4 text-[var(--accent)]">
              КУЛЬТУРА
            </h3>
            <p className="text-white/80 text-2xl">
              Театри, виставки та фестивалі для кожного.
            </p>
          </div>

          {/* NATURE */}
          <div className="p-8 rounded-2xl bg-black/20 backdrop-blur-md shadow-2xl border border-white/20 hover:-translate-y-2 transition">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-teal-400">
              <TreePine color="#fff" />
            </div>
            <h3 className="text-3xl font-semibold mb-4 text-[var(--accent)]">
              ПРИРОДА
            </h3>
            <p className="text-white/80 text-2xl">
              Прогулянки вздовж Дніпра та зелені парки.
            </p>
          </div>

        </div>
      </div>

            {/* ================= HERO 3 ================= */}
      <div className="h-screen w-full flex items-center justify-center relative bg-black/50 text-white">

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

            {/* ================= NEWS ================= */}
      <div className="py-20 px-12 bg-black/20">

        <h2 className="text-4xl font-bold text-center text-white mb-12">
          Останні новини
        </h2>

        {news.length > 0 ? (
          <NewsGrid items={news} />
        ) : (
          <p className="text-center text-white/50 text-xl">
            Новин поки немає...
          </p>
        )}

      </div>

          </div>
  );
}