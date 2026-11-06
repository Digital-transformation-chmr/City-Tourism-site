
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  MapPin,
  Camera,
  Compass,
  Lightbulb,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Map from "../../../components/UI/map";

type Excursion = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  duration: number;
  placeIds: number[];
  coverImage: string | null;
  status: string;
};

type Place = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string;
  images: string[];
  yearBuilt: number | null;
  status: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  tags: string[];
};

function formatDuration(minutes: number) {
  if (!minutes) return "Не вказано";

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} хв`;
  if (remaining === 0) return `${hours} год`;

  return `${hours} год ${remaining} хв`;
}

export default function Page() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Завантаження екскурсії та локацій
  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/excursions", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити екскурсії");
        }

        const data = await response.json();

        if (!Array.isArray(data.excursions)) {
          throw new Error("Некоректний формат відповіді API");
        }

        const found = data.excursions.find(
          (item: Excursion) =>
            item.slug === slug &&
            item.status === "published"
        );

        if (!found) {
          setExcursion(null);
          setPlaces([]);
          return;
        }

        setExcursion(found);

        const loadedPlaces = await Promise.all(
          (found.placeIds || []).map(async (id: number) => {
            const placeResponse = await fetch(
              `/api/places/${id}`,
              {
                cache: "no-store",
                signal: controller.signal,
              }
            );

            if (!placeResponse.ok) return null;

            const place = await placeResponse.json();

            return place?.id ? place : null;
          })
        );

        setPlaces(
          loadedPlaces.filter(
            (place): place is Place => Boolean(place)
          )
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Помилка завантаження екскурсії:",
          error
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [slug]);

  // Блокування прокручування для Lightbox
  useEffect(() => {
    document.body.style.overflow = isImageOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isImageOpen]);

  // Клавіатура для Lightbox
  useEffect(() => {
    if (!isImageOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsImageOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageOpen]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!excursion) {
    notFound();
  }

  const routePoints = places
    .filter(
      (place) => place.lat != null && place.lng != null
    )
    .map((place) => ({
      id: place.id,
      lat: place.lat!,
      lng: place.lng!,
      title: place.title,
    }));

  return (
    <main className="min-h-screen bg-white text-[#243142]">

      {/* =========================================
          HERO
      ========================================= */}

      <section className="relative pt-10 isolate h-[560px] min-h-[560px] w-full overflow-hidden sm:h-[400px] sm:min-h-[400px] lg:h-[540px] lg:min-h-[540px]">

        {excursion.coverImage ? (
          <Image
            src={excursion.coverImage}
            alt={excursion.title}
            fill
            priority
            sizes="100vw"
            className="object-cover cursor-zoom-in"
            onClick={() => setIsImageOpen(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-[#dce5e9]" />
        )}

        {/* Затемнення */}
        

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:px-12 lg:py-8">

          {/* Ліва частина */}

          <div className="flex max-w-[760px] flex-col items-start">

            <Link
              href="/site/Excursions"
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-4 py-2 text-sm font-semibold text-[#388d43] shadow-sm backdrop-blur-md transition hover:bg-white"
            >
              <ArrowLeft size={17} />
              Усі екскурсії
            </Link>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#edf6e9] px-4 py-2 text-sm font-semibold text-[#398f43]">
              <Compass size={17} />
              Екскурсійний маршрут
            </div>

            <h1 className="max-w-[750px] text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[48px]">
              {excursion.title}
            </h1>

            {excursion.subtitle && (
              <p className="mt-4 max-w-[580px] text-base leading-7 text-white/90 sm:text-lg">
                {excursion.subtitle}
              </p>
            )}

            {/* Коротка статистика */}

            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-white">

              <div className="flex items-center gap-2">
                <Clock3 size={19} />
                {formatDuration(excursion.duration)}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={19} />
                {places.length} локацій
              </div>

              <div className="flex items-center gap-2">
                <Camera size={19} />
                Цікаві місця Черкас
              </div>

            </div>
          </div>

          {/* Права картка */}

          <div className="hidden lg:block mt-5 w-full max-w-[330px] self-end rounded-2xl bg-white p-5 shadow-xl lg:mt-0 lg:self-center">

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#243142]">
                Маршрут у цифрах
              </h2>

              <Bookmark size={21} className="text-[#64748b]" />
            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-[#526071]">
                  <Clock3
                    size={20}
                    className="text-[#429b4b]"
                  />
                  Тривалість
                </div>

                <span className="text-sm font-bold text-[#243142]">
                  {formatDuration(excursion.duration)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-[#526071]">
                  <MapPin
                    size={20}
                    className="text-[#429b4b]"
                  />
                  Локації
                </div>

                <span className="text-sm font-bold text-[#243142]">
                  {places.length}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-sm text-[#526071]">
                  <Camera
                    size={20}
                    className="text-[#429b4b]"
                  />
                  Фотолокації
                </div>

                <span className="text-sm font-bold text-[#243142]">
                  {places.filter((p) => p.images?.length > 0).length}
                </span>
              </div>

            </div>

            {routePoints.length > 0 && (
              <button
                onClick={() => {
                  document
                    .getElementById("route-map")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ff981c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ed8610]"
              >
                <Compass size={18} />
                Переглянути маршрут
              </button>
            )}

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: excursion.title,
                    text: excursion.subtitle || excursion.description,
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(
                    window.location.href
                  );
                }
              }}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#f0f1f2] px-5 py-3 text-sm font-semibold text-[#243142] transition hover:bg-[#e4e6e8]"
            >
              <ArrowUpRight size={18} />
              Поділитися
            </button>

          </div>
        </div>
      </section>

      {/* =========================================
          ABOUT + MAP
      ========================================= */}

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-12">

        {/* Про маршрут */}

        <div className="flex flex-col">

          <h2 className="text-2xl font-bold tracking-tight text-[#243142] sm:text-3xl">
            Про маршрут
          </h2>

          <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.65] text-[#354357] sm:text-base">
            {excursion.description}
          </p>

          {excursion.subtitle && (
            <p className="mt-3 text-[15px] leading-[1.65] text-[#354357]">
              {excursion.subtitle}
            </p>
          )}

          {/* Переваги */}

          <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#edf5e9] p-4 sm:p-5">

            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin
                size={25}
                className="shrink-0 text-[#499b45]"
              />
              <span className="text-xs font-medium leading-5 text-[#344456] sm:text-sm">
                Цікаві локації
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Compass
                size={25}
                className="shrink-0 text-[#499b45]"
              />
              <span className="text-xs font-medium leading-5 text-[#344456] sm:text-sm">
                Нові враження
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Camera
                size={25}
                className="shrink-0 text-[#499b45]"
              />
              <span className="text-xs font-medium leading-5 text-[#344456] sm:text-sm">
                Фотолокації
              </span>
            </div>

          </div>
        </div>

        {/* Карта */}

        {routePoints.length > 0 && (
          <div
            id="route-map"
            className="relative h-[300px] overflow-hidden rounded-2xl border border-[#e5e9ed] bg-[#edf1ed] shadow-sm sm:h-[340px] lg:h-[265px]"
          >

            <Map
              id={`map-excursion-${excursion.id}`}
              points={routePoints}
            />

            <div className="absolute right-3 top-3 z-[500] rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-[#243142] shadow-md backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-[#419849]" />
                {routePoints.length} точок на карті
              </span>
            </div>

          </div>
        )}

      </section>

      {/* =========================================
          PLACES + TIPS
      ========================================= */}

      {places.length > 0 && (
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-9 px-5 pb-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12 lg:px-12">

          {/* Локації */}

          <div>

            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-[#243142] sm:text-3xl">
                Маршрут у деталях
              </h2>

              <p className="mt-2 text-sm text-[#657184] sm:text-base">
                Місця, які варто відвідати під час подорожі
              </p>
            </div>

            <div className="relative">

              {/* Вертикальна лінія */}

              <div className="absolute bottom-8 left-[15px] top-5 w-[3px] rounded-full bg-[#e8ecea]" />

              <div className="space-y-7">

                {places.map((place, index) => (
                  <motion.div
                    key={place.id}
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.1,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                    }}
                    className="relative grid grid-cols-1 gap-4 pl-12 sm:grid-cols-[1fr_0.9fr] sm:gap-5"
                  >

                    {/* Номер і текст */}

                    <div className="relative">

                      <div className="absolute -left-12 top-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#499b45] text-sm font-bold text-white shadow-sm">
                        {index + 1}
                      </div>

                      <Link
                        href={`/site/PlacePage/${place.id}`}
                        className="group inline-block"
                      >
                        <h3 className="text-base font-bold text-[#243142] transition-colors group-hover:text-[#499b45] sm:text-lg">
                          {place.title}
                        </h3>

                        {place.subtitle && (
                          <p className="mt-2 text-sm leading-6 text-[#536174]">
                            {place.subtitle}
                          </p>
                        )}

                        <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#499b45] transition-all group-hover:gap-2">
                          Детальніше
                          <ArrowUpRight size={15} />
                        </span>
                      </Link>

                    </div>

                    {/* Фото */}

                    <Link
                      href={`/site/PlacePage/${place.id}`}
                      className="group relative block aspect-[16/9] overflow-hidden rounded-xl bg-[#edf0ef] sm:aspect-[16/9]"
                    >

                      {place.images?.[0] ? (
                        <Image
                          src={place.images[0]}
                          alt={place.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 40vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#89939f]">
                          Фото відсутнє
                        </div>
                      )}

                    </Link>

                  </motion.div>
                ))}

              </div>
            </div>
          </div>

          {/* Права інформаційна колонка */}

          <aside className="hidden lg:block space-y-5 lg:pt-0">

            {/* Корисно знати */}

            <div className="rounded-2xl bg-[#fcf6eb] p-5 sm:p-6">

              <div className="mb-5 flex items-center gap-3">
                <Lightbulb
                  size={27}
                  className="text-[#f39a22]"
                />

                <h3 className="text-xl font-bold text-[#243142]">
                  Корисно знати
                </h3>
              </div>

              <div className="space-y-4 text-sm leading-6 text-[#354357]">

                <div className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-[#499b45]">
                    ✓
                  </span>
                  <p>
                    Заздалегідь ознайомтеся з усіма локаціями маршруту
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-[#499b45]">
                    ✓
                  </span>
                  <p>
                    Обирайте зручне взуття для прогулянки
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-[#499b45]">
                    ✓
                  </span>
                  <p>
                    Візьміть із собою воду та фотоапарат
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-1 font-bold text-[#499b45]">
                    ✓
                  </span>
                  <p>
                    Перевірте графік роботи окремих локацій перед відвідуванням
                  </p>
                </div>

              </div>
            </div>


          </aside>
        </section>
      )}

      {/* =========================================
          LIGHTBOX
      ========================================= */}

      {mounted &&
        excursion.coverImage &&
        createPortal(
          <AnimatePresence>
            {isImageOpen && (
              <motion.div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsImageOpen(false)}
              >

                <motion.div
                  className="relative h-[90vh] w-[95vw]"
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={excursion.coverImage}
                    alt={excursion.title}
                    fill
                    sizes="95vw"
                    className="object-contain"
                  />
                </motion.div>

                <button
                  onClick={() => setIsImageOpen(false)}
                  aria-label="Закрити фото"
                  className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
                >
                  <X size={25} />
                </button>

              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

    </main>
  );
}

// =========================================
// LOADING SKELETON
// =========================================

function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-white">

      <div className="h-[340px] animate-pulse bg-[#e4e9e7]" />

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 py-10 lg:grid-cols-2 lg:px-12">

        <div className="space-y-5">
          <div className="h-9 w-2/3 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-gray-100" />
          <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
        </div>

        <div className="h-[280px] animate-pulse rounded-2xl bg-gray-200" />

      </div>

      <div className="mx-auto max-w-[1440px] space-y-6 px-5 py-10 lg:px-12">
        <div className="h-9 w-1/3 animate-pulse rounded-lg bg-gray-200" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
          <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>

    </main>
  );
}
