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
import LogoLoop from "@/components/LogoLoop";
import Marquee from "../components/UI/Marquee";
import { CategoriesSection } from "../components/UI/category";

import { FaDiamond } from "react-icons/fa6";
import { motion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const TITLE = "ЧЕРКАСИ".split("");

const ease = [0.16, 1, 0.3, 1] as const;

const HEADLINE: { text: string; accent?: boolean }[] = [
  { text: "Відкрий" },
  { text: "Черкаси", accent: true },
  { text: "по-новому" },
];

const cherkasyFacts = [
    { title: "Засновано 1354 року" },
    { title: "Місто над Дніпром" },
    { title: "Серце Черкащини" },
    { title: "Набережна довжиною 5 км" },
  ];

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
  

  const [ready, setReady] = useState(false);
 
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);
 

  type CategoryKey = "food" | "entertainment" | "newbies";

  interface PlaceItem {
  icon: string;
  title: string;
  desc: string;
  }

return (
    <div ref={mainRef} className="overflow-x-hidden">

     <div className="mx-auto flex min-h-[70vh] flex-col-reverse items-center gap-12 overflow-hidden px-6 py-12 lg:flex-row lg:gap-16 lg:px-10 lg:py-20">

  {/* ================= ЛІВА КОЛОНКА ================= */}
  <div className="flex w-full flex-col justify-center lg:flex-[1]">

    {/* Бейдж */}
    <div className="mb-6 flex">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={ready ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease, delay: 0.15 }}
        className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.93_0.03_250)] px-5 py-2 text-base font-semibold text-[oklch(0.32_0.11_250)]"
      >
        Місто над Дніпром
      </motion.div>
    </div>

    {/* Заголовок */}
    <div className="mb-6">
      <h1 className="flex flex-wrap gap-x-3 font-[Unbounded,sans-serif] text-5xl font-bold leading-tight text-[oklch(0.22_0.05_250)] lg:text-6xl">
        {HEADLINE.map((word, i) => (
          <span key={i} className="overflow-hidden">
            <motion.span
              initial={{ y: "110%", opacity: 0 }}
              animate={ready ? { y: 0, opacity: 1 } : {}}
              transition={{
                duration: 0.8,
                ease,
                delay: 0.4 + i * 0.12,
              }}
              className={`inline-block ${
                word.accent ? "text-[oklch(0.55_0.19_25)]" : ""
              }`}
            >
              {word.text}
            </motion.span>
          </span>
        ))}
      </h1>
    </div>

    {/* Опис */}
    <div className="mb-10 max-w-2xl">
      <motion.p
        initial={{ y: 18, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease, delay: 0.85 }}
        className="text-xl leading-relaxed text-[oklch(0.32_0.03_250)] lg:text-2xl"
      >
        Козацька історія, набережна Дніпра, затишні кав&apos;ярні та тепла
        атмосфера — місто, яке варто відчути особисто. Ми зібрали найкраще,
        щоб ти нічого не пропустив.
      </motion.p>
    </div>

    {/* Кнопки */}
    <div className="flex">
      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={ready ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.7, ease, delay: 1.05 }}
        className="flex flex-wrap gap-4"
      >
        <a
          href="#places"
          className="scp2 rounded-xl bg-[oklch(0.42_0.13_250)] px-8 py-4 text-lg font-semibold text-white transition-transform duration-300 hover:scale-105"
        >
          Почати мандрівку
        </a>

        <a
          href="#tours"
          className="rounded-xl border-2 border-[oklch(0.42_0.13_250)] px-8 py-4 text-lg font-semibold text-[oklch(0.32_0.11_250)] transition-colors duration-300 hover:border-[oklch(0.55_0.19_25)]"
        >
          Обрати тур
        </a>
      </motion.div>
    </div>
  </div>

  {/* ================= ПРАВА КОЛОНКА ================= */}
  <motion.div
    initial={{ opacity: 0, x: 80, scale: 0.9 }}
    animate={ready ? { opacity: 1, x: 0, scale: 1 } : {}}
    transition={{ duration: 1.2, ease }}
    className="relative h-[400px] w-full lg:h-[650px] lg:flex-[1.3]"
  >
    {/* Декоративне світіння */}
    <div className="absolute top-6 left-6 h-full w-full rounded-[40px] bg-[oklch(0.55_0.19_25)]/15 blur-3xl" />

    {/* Фото */}
    <div className="relative h-full w-full overflow-hidden rounded-[40px] shadow-2xl">
      <Image
        src="/Banners/banner1.jpeg"
        alt="Панорама Черкас"
        fill
        priority
        className="object-cover transition-transform duration-[6000ms] hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  </motion.div>

</div>    
  {/* ================= END HERO 1 ================= */}
    <div className="w-full overflow-hidden bg-[oklch(0.22_0.05_250)] py-3.5 select-none">
      <Marquee 
        items={cherkasyFacts} 
        speed={30}// твоя швидкість з анімації (28s)
        pauseOnHover={false} // у твоєму коді не було паузи, тому вимикаємо
        // Передаємо ромбик з твоїм кольором oklch(0.55 0.19 25)
        defaultLogo={<FaDiamond className="text-[#d20707] text-xs" />} 
      />
    </div>


 {/* ================= TOP SECTION ================= */}

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.18,
              },
            },
          }}
          className="relative overflow-hidden py-20 px-8 md:px-12"
        >
          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">

            <div>

              {/* Small Label */}
              <motion.div
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 15,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.6,
                    },
                  },
                }}
                style={{ color: "oklch(0.55 0.19 25)" }}
                className="mb-2 text-sm font-bold uppercase tracking-[0.2em]"
              >
                Популярні місця
              </motion.div>

              {/* Title */}
              <motion.h2
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 30,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                style={{ color: "oklch(0.22 0.05 250)" }}
                className="
                  font-['Unbounded']
                  text-4xl
                  md:text-5xl
                  font-bold
                "
              >
                Куди піти в{" "}
                <motion.span
                  initial={{ color: "oklch(0.22 0.05 250)" }}
                  whileInView={{ color: "oklch(0.55 0.19 25)" }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="italic"
                >
                  перший день
                </motion.span>
              </motion.h2>

            </div>

            {/* Description */}
            <motion.p
              variants={{
                hidden: {
                  opacity: 0,
                  x: 40,
                },
                show: {
                  opacity: 1,
                  x: 0,
                  transition: {
                    duration: 0.8,
                  },
                },
              }}
              style={{ color: "oklch(0.4 0.04 250)" }}
              className="
                max-w-sm
                text-[15px]
                leading-7
              "
            >
              Топ локацій, які найчастіше радять самі черкащани — від
              набережної до затишних парків.
            </motion.p>

          </div>
        </motion.section>
      {/* ================= POP PLACES GRID ================= */}
      <div className="my-8 mx-2 px-10 py-4">
        <PopPlaceGrid Places={places} />
      </div>

            {/* ================= HERO 2 ================= */}
        <CategoriesSection></CategoriesSection>

        

            {/* ================= NEWS ================= */}


        {news.length > 0 ? (
          <NewsGrid items={news} />
        ) : (
          <p className="text-center text-white/50 text-xl">
          </p>
        )}


    

  </div>
  );
}