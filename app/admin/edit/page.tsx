"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Map from "../../components/UI/map";

type Place = {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  images: string[];
  yearBuilt: number;
  status: string;
  type: string;
  visiting: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  phone?: string | null;
  website?: string | null;
  tags: string[];
};

const DEFAULT_LAT = 49.4444;
const DEFAULT_LNG = 32.0598;

const emptyPlace: Place = {
  title: "",
  subtitle: "",
  description: "",
  images: [],
  yearBuilt: 0,
  status: "",
  type: "",
  visiting: "",
  address: "",
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  openingHours: "",
  phone: "",
  website: "",
  tags: [],
};

export default function AdminEditPage() {
  useEffect(() => {
  console.log("📡 Спроба «прокинути» сервер для перевірки бази даних...");
  
  // Робимо запит до API, щоб змусити Next.js завантажити файл з Prisma Client
  fetch("/api/places?limit=1")
    .then(() => {
      console.log("🛰 Сервер відповів. Перевірте чорний терминал VS Code (npm run dev)!");
    })
    .catch((err) => {
      console.error("Помилка зв'язку з API роутом:", err);
    });
}, []);


  const [place, setPlace] = useState<Place>(emptyPlace);
  const [activeImage, setActiveImage] = useState(0);
  
  // Тимчасовий стейт для тегів, щоб уникнути стрибків курсору при введенні кожної літери
  const [tagsInput, setTagsInput] = useState("");

  // Синхронізуємо текст в інпуті тегів, коли завантажуються дані місця
  useEffect(() => {
    setTagsInput(place.tags.join(", "));
  }, [place.id]);

  useEffect(() => {
    setActiveImage(0);
  }, [place.images]);

  // 📤 upload image
  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      console.error(await res.text());
      return;
    }

    const data = await res.json();

    setPlace((prev) => ({
      ...prev,
      images: [...prev.images, data.url],
    }));
  };

  // 💾 save place
  const handleSave = async () => {
    const isEdit = !!place.id;

    // Фінально парсимо теги перед відправкою на сервер
    const finalTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const placeToSend = { ...place, tags: finalTags };

    const res = await fetch(
      `/api/places${isEdit ? `/${place.id}` : ""}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placeToSend),
      }
    );

    if (!res.ok) {
      console.error(await res.text());
      alert("Помилка збереження. Перевірте консоль сервера.");
      return;
    }

    const data = await res.json();
    setPlace(data);
    setTagsInput(data.tags.join(", "));
    alert(isEdit ? "Updated" : "Created");
  };

  return (
    <div className="text-white/80 min-h-screen">

      {/* 🖼 HERO */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {place.images.length > 0 ? (
          place.images.map((img, i) => (
            <Image
              key={img}
              src={img}
              alt=""
              fill
              sizes="100vw" /* ✅ Виправлено попередження Next.js */
              className={`object-cover transition-opacity duration-1000 ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
              priority={i === activeImage}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/30">
            Upload images to start editing
          </div>
        )}

        <div className="absolute inset-0 bg-black/30" />

        {/* thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {place.images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-10 relative cursor-pointer border ${
                i === activeImage ? "border-white" : "border-white/30"
              }`}
            >
              <Image 
                src={img} 
                alt="" 
                fill 
                sizes="64px" /* ✅ Оптимізація для мініатюр */
                className="object-cover" 
              />
            </div>
          ))}
        </div>

        {/* upload */}
        <div className="absolute top-4 right-4 z-10">
          <input
            type="file"
            multiple
            className="text-sm"
            onChange={(e) => {
              if (!e.target.files) return;
              Array.from(e.target.files).forEach(uploadImage);
            }}
          />
        </div>
      </div>

      {/* 📄 CONTENT */}
      <div className="px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40 backdrop-blur-md">
          <input
            className="text-4xl font-bold w-full bg-transparent outline-none border-b border-white/10 pb-2"
            placeholder="Title"
            value={place.title}
            onChange={(e) => setPlace({ ...place, title: e.target.value })}
          />

          <textarea
            className="w-full bg-transparent outline-none text-white/80 min-h-[300px] resize-none"
            placeholder="Description"
            value={place.description}
            onChange={(e) => setPlace({ ...place, description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <input
              className="bg-black/30 border border-white/20 p-2 rounded"
              placeholder="Year"
              type="number"
              value={place.yearBuilt || ""}
              onChange={(e) =>
                setPlace({
                  ...place,
                  yearBuilt: Number(e.target.value),
                })
              }
            />

            <input
              className="bg-black/30 border border-white/20 p-2 rounded"
              placeholder="Address"
              value={place.address}
              onChange={(e) => setPlace({ ...place, address: e.target.value })}
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4 backdrop-blur-md">
          <h3 className="text-lg font-semibold">Edit details</h3>

          <textarea
            className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white/80 min-h-[10px] resize-none"
            placeholder="Subtitle"
            value={place.subtitle}
            onChange={(e) => setPlace({ ...place, subtitle: e.target.value })}
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Status"
            value={place.status}
            onChange={(e) => setPlace({ ...place, status: e.target.value })}
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Type"
            value={place.type}
            onChange={(e) => setPlace({ ...place, type: e.target.value })}
          />

          {/* ✅ Додано поле Visiting, якого не вистачало для Prisma */}
          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Visiting rules / Conditions"
            value={place.visiting}
            onChange={(e) => setPlace({ ...place, visiting: e.target.value })}
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Opening hours"
            value={place.openingHours}
            onChange={(e) => setPlace({ ...place, openingHours: e.target.value })}
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Phone"
            value={place.phone ?? ""}
            onChange={(e) => setPlace({ ...place, phone: e.target.value })}
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Website"
            value={place.website ?? ""}
            onChange={(e) => setPlace({ ...place, website: e.target.value })}
          />

          {/* 🏷 ТЕГИ (Тепер працюють плавно без багів введення) */}
          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Tags (separated by comma ,)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </aside>
      </div>

      {/* 🗺 MAP + COORDS */}
      <div className="px-12 pb-10 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <input
            className="w-full p-2 bg-black/40 border border-white/20 rounded-lg"
            placeholder="Latitude"
            type="number"
            step="any"
            value={place.lat ?? DEFAULT_LAT}
            onChange={(e) => setPlace({ ...place, lat: Number(e.target.value) })}
          />

          <input
            className="w-full p-2 bg-black/40 border border-white/20 rounded-lg"
            placeholder="Longitude"
            type="number"
            step="any"
            value={place.lng ?? DEFAULT_LNG}
            onChange={(e) => setPlace({ ...place, lng: Number(e.target.value) })}
          />
        </div>

        <div className="h-75 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <Map
            lat={place.lat ?? DEFAULT_LAT}
            lng={place.lng ?? DEFAULT_LNG}
            title={place.title || "Cherkasy"}
          />
        </div>
      </div>

      {/* 💾 SAVE */}
      <div className="p-10 flex justify-center">
        <button
          onClick={handleSave}
          className="px-10 py-3 bg-black/30 border border-white/30 backdrop-blur-md hover:bg-white/20 transition rounded font-medium"
        >
          {place.id ? "Update place" : "Create place"}
        </button>
      </div>
    </div>
  );
}