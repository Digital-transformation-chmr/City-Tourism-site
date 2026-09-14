"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Map from "../../../components/UI/map";
import { Place } from "@/app/components/Places/placeCard";
import { AnimatePresence, motion } from "motion/react";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [place, setPlace] = useState<Place | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const res = await fetch(`/api/places/${id}`);
      const data = await res.json();

      setPlace(data);
      setActiveImage(0);
    };

    load();
  }, [id]);

  const nextImage = () => {
    if (!place?.images?.length) return;
    setActiveImage((prev) => (prev + 1) % place.images.length);
  };

  const prevImage = () => {
    if (!place?.images?.length) return;
    setActiveImage((prev) =>
      prev === 0 ? place.images.length - 1 : prev - 1
    );
  };

  if (!place) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="text-white/80 min-h-screen">

      {/* HERO */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {place.images?.map((img, i) => (
          <Image
            key={img}
            src={img}
            alt={place.title}
            fill
            className={`object-cover transition-opacity duration-1000 ${
              i === activeImage
                ? "opacity-100 cursor-zoom-in"
                : "opacity-0 pointer-events-none"
            }`}
            priority={i === activeImage}
            onClick={() => setIsImageOpen(true)}
          />
        ))}

        <div className="absolute inset-0 bg-black/30 pointer-events-none" />

        {!isImageOpen && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-5 top-1/2 -translate-y-1/2 z-20
                        w-12 h-12 rounded-full bg-black/50
                        backdrop-blur-md flex items-center justify-center
                        text-white cursor-pointer"
            >
              <span className="w-3 h-3 border-l-2 border-b-2 rotate-45 translate-x-0.5" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-5 top-1/2 -translate-y-1/2 z-20
                        w-12 h-12 rounded-full bg-black/50
                        backdrop-blur-md flex items-center justify-center
                        text-white cursor-pointer"
            >
              <span className="w-3 h-3 border-r-2 border-t-2 rotate-45 -translate-x-0.5" />
            </button>
          </>
        )}

        {/* thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {place.images?.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-10 relative cursor-pointer border transition-all ${
                i === activeImage
                  ? "border-white"
                  : "border-white/30"
              }`}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

<AnimatePresence>
  {isImageOpen && (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm
                 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={() => setIsImageOpen(false)}
    >
      {/* IMAGE */}
      <motion.div
        className="relative z-[1000] w-[95vw] h-[95vh]"
        initial={{
          opacity: 0,
          scale: 0.85,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.85,
        }}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={place.images[activeImage]}
          alt={place.title}
          fill
          className="object-contain"
          sizes="95vw"
          priority
        />
      </motion.div>

      {/* CLOSE */}
      <motion.button
        onClick={() => setIsImageOpen(false)}
        className="absolute top-20 right-5 z-[110]
                   w-12 h-12 rounded-full
                   bg-white/90 hover:bg-white/70
                   backdrop-blur-md
                   flex items-center justify-center
                   text-black text-3xl cursor-pointer"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        ×
      </motion.button>

      {/* PREVIOUS */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          prevImage();
        }}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-[110]
                   w-12 h-12 rounded-full
                   bg-black/50 hover:bg-black/70
                   backdrop-blur-md
                   flex items-center justify-center
                   text-white text-3xl cursor-pointer"
        whileHover={{ scale: 1.1, x: -3 }}
        whileTap={{ scale: 0.9 }}
      >
         <span className="w-3 h-3 border-l-2 border-b-2 rotate-45  translate-x-0.5" />
      </motion.button>

      {/* NEXT */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation();
          nextImage();
        }}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-[110]
                   w-12 h-12 rounded-full
                  bg-black/50 hover:bg-black/70
                   backdrop-blur-md
                   flex items-center justify-center
                   text-white text-3xl cursor-pointer"
        whileHover={{ scale: 1.1, x: 3 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="w-3 h-3 border-r-2 border-t-2 rotate-45 -translate-x-0.5" />
      </motion.button>

      {/* COUNTER */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[110]
                   px-4 py-2 rounded-full
                   bg-black/50 backdrop-blur-md
                   text-white text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeImage + 1} / {place.images.length}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* CONTENT */}
      <div className="px-4 sm:px-8 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40">
          <h1 className="text-3xl sm:text-4xl font-bold">{place.title}</h1>

          <p>{place.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>📅 Рік: {place.yearBuilt}</div>
            <div>📍 {place.address}</div>
            <div>🏛 {place.status}</div>
          </div>

          <p className="text-lg font-semibold">Додаткова інформація</p>

          <p className="text-lg">
            {place.subtitle}
            <br />Години: {place.openingHours}
            <br />{place.phone ? `Телефон: ${place.phone}` : ""}
              {place.website && (
                  <>
                    <br />
                    <a
                      href={
                        place.website.startsWith("http")
                          ? place.website
                          : `https://${place.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" hover:text-blue-700 underline"
                    >
                      Вебсайт:{" "}{place.website}
                    </a>
                  </>
                )}
          </p>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {place.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 text-sm text-white/80 bg-white/5 border border-white/20 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* MAP */}
        <aside className="bg-black/40 border border-white/30 rounded-xl p-3 sm:p-4 lg:p-5">
          <div className="w-full h-[250px] sm:h-[350px] lg:h-[500px] rounded-xl overflow-hidden">
            <Map
              id={`map-page-${place.id}`}
              lat={place.lat!}
              lng={place.lng!}
              title={place.title || "Cherkasy"}
              
            />
          </div>
        </aside>

      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="text-white/80 min-h-screen">
      <div className="h-[85vh] bg-gray-800 animate-pulse" />

      <div className="px-4 sm:px-8 lg:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-10 bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6" />
          </div>
        </div>

        <div className="h-[300px] bg-gray-800 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}