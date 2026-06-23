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
    return <div className="text-white p-10">Завантаження...</div>;
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
              className={`w-16 h-10 relative cursor-pointer border ${
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
        </div>

        <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Додаткова інформація</h3>

          <p className="text-sm">
            {place.subtitle}
            <br />Години: {place.openingHours}
            <br />{place.phone ? `Телефон: ${place.phone}` : ""}
            <br />{place.website ? `Вебсайт: ${place.website}` : ""}
          </p>
        </aside>
      </div>

      {/* MAP (з перевіркою) */}
      <div className="px-12 pb-10">
        {place.lat && place.lng ? (
          <Map
            lat={place.lat}
            lng={place.lng}
            title={place.title}
          />
        ) : (
          <div className="h-75 flex items-center justify-center text-white/40 border border-white/10 rounded-xl">
            Карта недоступна
          </div>
        )}
      </div>
    </div>
  );
}