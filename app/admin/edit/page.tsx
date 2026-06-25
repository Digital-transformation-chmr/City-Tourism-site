"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useMapEvents } from "react-leaflet";
import Map from "../../components/UI/map";

type Place = {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  images: string[];
  yearBuilt: number;
  type: string;
  status: string;
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
  visiting: "",
  type: "",
  address: "",
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  openingHours: "",
  phone: "",
  website: "",
  tags: [],
};

const STORAGE_KEY = "place_draft";

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect?: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function AdminEditPage({
  initialData,
}: {
  initialData?: Place;
}) {
  const [place, setPlace] = useState<Place>(initialData ?? emptyPlace);
  const [activeImage, setActiveImage] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [isClient, setIsClient] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔑 Генеруємо унікальний ключ для чернетки залежно від режиму (створення чи редагування)
  const draftKey = initialData?.id
    ? `${STORAGE_KEY}_edit_${initialData.id}`
    : `${STORAGE_KEY}_new`;

  // ✅ Завантажуємо дані з localStorage при першому рендері
  useEffect(() => {
    setIsClient(true);

    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsedPlace = JSON.parse(saved);
        
        // Запобіжник: якщо це створення нового, видаляємо ID, який міг затесатися
        if (!initialData?.id) {
          delete parsedPlace.id;
        }
        
        setPlace(parsedPlace);
        setTagsInput(parsedPlace.tags?.join(", ") || "");
      } catch (error) {
        console.error("Помилка завантаження з localStorage:", error);
      }
    } else if (initialData) {
      // Якщо чернетки в localStorage немає, але є початкові дані (редагування)
      setPlace(initialData);
      setTagsInput(initialData.tags?.join(", ") || "");
    }
  }, [draftKey, initialData]);

  // ✅ Автоматично зберігаємо стан форми в localStorage при будь-яких змінах
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(draftKey, JSON.stringify(place));
    }
  }, [place, isClient, draftKey]);

  // ✅ Синхронізуємо текст в інпуті тегів, коли завантажуються дані існуючого місця
  useEffect(() => {
    if (place.id || place.tags.length > 0) {
      setTagsInput(place.tags.join(", "));
    }
  }, [place.id]);

  useEffect(() => {
    setActiveImage(0);
  }, [place.images]);

  // 📤 upload image
  const uploadImages = async (files: File[]) => {
    const form = new FormData();

    files.forEach((file) => {
      form.append("files", file);
    });

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
      images: [...prev.images, ...data.urls],
    }));
  };

  // 💾 save place
  const handleSave = async () => {
    const isEdit = !!place.id;

    // 🧼 нормалізація тегів
    const finalTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // 🧼 чистимо дані перед відправкою (вирізаємо зайві пробіли)
    const placeToSend = {
      ...place,
      title: place.title?.trim() || "",
      subtitle: place.subtitle?.trim() || "",
      description: place.description?.trim() || "",
      address: place.address?.trim() || "",
      status: place.status?.trim() || "",
      visiting: place.visiting?.trim() || "",
      openingHours: place.openingHours?.trim() || "",
      phone: place.phone?.trim() || null,
      website: place.website?.trim() || null,

      yearBuilt: Number(place.yearBuilt) || 0,
      lat: Number(place.lat),
      lng: Number(place.lng),

      tags: finalTags,
    };

    try {
      const res = await fetch(
        `/api/places${isEdit ? `/${place.id}` : ""}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(placeToSend),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ API ERROR:", errText);
        alert("Помилка збереження. Дивись консоль.");
        return;
      }

      const data = await res.json();

      // Оновлюємо стан актуальними даними з сервера
      setPlace((prev) => ({
        ...prev,
        ...data,
      }));

      setTagsInput((data.tags || []).join(", "));

      // ✅ Очищуємо саме ту чернетку, яку щойно успішно зберегли
      localStorage.removeItem(draftKey);

      alert(isEdit ? "Updated" : "Created");
    } catch (error) {
      console.error("❌ Network error:", error);
      alert("Network error");
    }
  };

  // ✅ Функція для ручної очистки поточної чернетки
  const handleClearDraft = () => {
    if (confirm("Ви впевнені? Всі незбережені дані буде видалено.")) {
      localStorage.removeItem(draftKey);
      setPlace(emptyPlace);
      setTagsInput("");
      alert("Чорновик видалено");
    }
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
              sizes="100vw"
              className={`object-cover transition-opacity duration-1000 ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
              priority={i === activeImage}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/30">
            Фотографії відсутні
          </div>
        )}

        <div className="absolute inset-0 bg-black/30" />

        {/* thumbnails */}
        {place.images.length > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {place.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveImage(i)}
                className={`w-16 h-10 relative cursor-pointer overflow-hidden rounded border transition ${
                  i === activeImage
                    ? "border-white"
                    : "border-white/30 hover:border-white/60"
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* upload */}
        <div className="absolute top-4 right-4 z-10">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="
              backdrop-blur-md
              bg-black/50
              border border-white/20
              rounded-xl
              px-4 py-3
              cursor-pointer
              hover:bg-black/70
              hover:border-[var(--accent)]
              transition
              text-white
              min-w-[220px]
            "
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;
                uploadImages(Array.from(e.target.files));
              }}
            />

            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M12 12v9m0-9l-3 3m3-3l3 3"
                />
              </svg>

              <div>
                <p className="text-sm font-medium">
                  Завантажити фото
                </p>
                <p className="text-xs text-white/60">
                  Натисніть для вибору
                </p>
              </div>
            </div>
          </div>
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
            placeholder="Type"
            value={place.type}
            onChange={(e) =>
              setPlace({ ...place, type: e.target.value })
            }
          />
          <input
            className="w-full p-2 bg-black/30 border border-white/20 rounded"
            placeholder="Status"
            value={place.status}
            onChange={(e) => setPlace({ ...place, status: e.target.value })}
          />

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

        <div className="h-96 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <Map
            lat={place.lat ?? DEFAULT_LAT}
            lng={place.lng ?? DEFAULT_LNG}
            title={place.title || "Cherkasy"}
            onLocationSelect={(lat, lng) =>
              setPlace((prev) => ({
                ...prev,
                lat,
                lng,
              }))
            }
          />
        </div>
      </div>

      {/* 💾 SAVE + CLEAR */}
      <div className="p-10 flex justify-center gap-4">
        <button
          onClick={handleSave}
          className="px-10 py-3 bg-black/30 border border-white/30 backdrop-blur-md hover:bg-white/20 transition rounded font-medium"
        >
          {place.id ? "Update place" : "Create place"}
        </button>

        {/* Кнопка очистки показується завжди для зручності */}
        <button
          onClick={handleClearDraft}
          className="px-10 py-3 bg-red-500/20 border border-red-500/30 backdrop-blur-md hover:bg-red-500/30 transition rounded font-medium text-red-400"
        >
          Clear draft
        </button>
      </div>
    </div>
  );
}