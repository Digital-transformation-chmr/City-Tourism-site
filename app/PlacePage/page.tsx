"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Map from "../components/UI/map";



export const monumentMock = {
  id: "hill-of-glory-cherkasy",
  title: "Пагорб Слави",
  subtitle: "Одна з найвідоміших історичних пам’яток Черкас",
  description:
    "Пагорб Слави — меморіальний комплекс, присвячений подіям Другої світової війни. Звідси відкривається панорамний вид на місто та Дніпро.",

  images: [
    "/PlacesPhoto/sosnovyj-bir.jpg",
    "/PlacesPhoto/sosnovyj-bir.jpg",
    "/PlacesPhoto/sosnovyj-bir.jpg",
  ],
  // 📍 основна інформація (центр сторінки)
  mainInfo: {
    yearBuilt: 1977,
    status: "Історична пам’ятка",
    type: "Меморіальний комплекс",
    visiting: "Вільний доступ",
  },

  // 🗺️ координати (для карти)
  location: {
    city: "Черкаси",
    country: "Україна",
    address: "Пагорб Слави, Черкаси",
    lat: 49.4444,
    lng: 32.0598,
  },

    openingHours: {
      alwaysOpen: true,
      note: "Відкрто 24/7",
    },

    contacts: {
      phone: null,
      website: null,
    },

    tags: ["історія", "меморіал", "панорама", "туризм"],
};

export default function Page() {
  const [activeImage, setActiveImage] = useState(0);
    useEffect(() => {
    const interval = setInterval(() => {
        setActiveImage((prev) =>
        prev === monumentMock.images.length - 1 ? 0 : prev + 1
        );
    }, 30000); // 5 хв

    return () => clearInterval(interval);
    }, []);
  return (
    <div className=" text-white/80 min-h-screen">

      {/* 🖼️ HERO SLIDER */}
        <div className="relative h-[85vh] w-full overflow-hidden">
        {monumentMock.images.map((img, i) => (
            <Image
            key={img}
            src={img}
            alt="monument"
            fill
            className={`object-cover transition-opacity duration-1000 ${
                i === activeImage ? "opacity-100" : "opacity-0"
            }`}
            priority={i === activeImage}
            />
        ))}

        {/* fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-transparent" />

        {/* thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {monumentMock.images.map((img, i) => (
            <div
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-10 relative cursor-pointer border transition ${
                i === activeImage ? "border-white" : "border-white/30"
                }`}
            >
                <Image src={img} alt="" fill className="object-cover" />
            </div>
            ))}
        </div>
        </div>

      {/* 📄 MAIN CONTENT */}
      <div className=" px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10   ">

        {/* center */}
        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40">
          <h1 className="text-4xl font-bold text-[var(--text-light)]">{monumentMock.title}</h1>

          <p className="text-[var(--text-light)]">
            {monumentMock.description}
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm text-[var(--text-light)]">
            <div>📅 Рік: {monumentMock.mainInfo.yearBuilt}</div>
            <div>📍 {monumentMock.location.address}</div>
            <div>🏛 {monumentMock.mainInfo.status}</div>
          </div>
        </div>

        {/* sidebar */}
            <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4 sticky top-6">

            <h3 className="text-lg font-semibold">
                Додаткова інформація
            </h3>

            <p className="text-[var(--text-light)] text-sm">
              {monumentMock.subtitle}
              <br/>Години праці: {monumentMock.openingHours.note}
              <br/>{monumentMock.contacts.phone ? `Телефон: ${monumentMock.contacts.phone}`: ""}
              <br/>{monumentMock.contacts.website ? `Вебсайт : ${monumentMock.contacts.website}`: ""}
            </p>

            </aside>
      </div>

      {/* 🗺️ MAP PLACEHOLDER */}
      <div className="px-12 pb-10 z-5">
        <div className="mx-auto">
          <div className="h-[300px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40">
                   <Map 
                    lat={49.4444}
                    lng={32.0598}
                    title="Пагорб Слави"
                    />
          </div>
        </div>
      </div>

    </div>
  );
}