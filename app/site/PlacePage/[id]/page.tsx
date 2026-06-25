"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Map from "../../../components/UI/map";
import { Place } from "@/app/components/Places/placeCard";

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

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
            alt="place"
            fill
            className={`object-cover transition-opacity duration-1000 ${
              i === activeImage ? "opacity-100" : "opacity-0"
            }`}
            priority={i === activeImage}
          />
        ))}

        <div className="absolute inset-0 bg-black/30" />

        {/* thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {place.images?.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-10 relative cursor-pointer border transition-all ${
                i === activeImage ? "border-white" : "border-white/30"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40">
          <h1 className="text-4xl font-bold">{place.title}</h1>

          <p>{place.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>📅 Рік: {place.yearBuilt}</div>
            <div>📍 {place.address}</div>
            <div>🏛 {place.status}</div>

          </div>
          
          <p className="text-lg font-semibold">Додаткова інформація</p>
          <p className="text-lg">
            {place.subtitle}
            <br />Години: {place.openingHours}
            <br />{place.phone ? `Телефон: ${place.phone}` : ""}
            <br />{place.website ? `Вебсайт: ${place.website}` : ""}
          </p>
          
          {place.tags && place.tags.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex flex-wrap gap-2">
                {place.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-sm font-medium text-white/80 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/40 transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4">
          <Map
            id={`map-page-${place.id}`}
            lat={place.lat!}
            lng={place.lng!}
            title={place.title || "Cherkasy"}
        />
        </aside>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="text-white/80 min-h-screen">
      {/* HERO SKELETON */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-pulse">
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENT SKELETON */}
      <div className="px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40">
          {/* Title skeleton */}
          <div className="h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse w-3/4" />

          {/* Description skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse" />
            <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse w-4/6" />
          </div>

          {/* Info grid skeleton */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4">
          <div className="h-6 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg animate-pulse w-1/2" />

          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* MAP SKELETON */}
      <div className="px-12 py-10">
        <div className="h-75 rounded-xl bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border border-white/10 overflow-hidden animate-pulse" />
      </div>

      {/* Floating loading text */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <span className="text-sm text-white/60">Завантаження...</span>
      </div>
    </div>
  );
}