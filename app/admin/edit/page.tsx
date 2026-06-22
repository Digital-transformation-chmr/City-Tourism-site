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
};

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
  lat: 49.444,
  lng: 32.0598,

  openingHours: "",

  phone: "",
  website: "",
};

export default function AdminEditPage() {
  const [place, setPlace] = useState<Place>(emptyPlace);
  const [activeImage, setActiveImage] = useState(0);

  // якщо прийде place з API (наприклад ти сам відкриєш edit існуючий)
  useEffect(() => {
    setActiveImage(0);
  }, [place.images]);

  const uploadImage = async (file: File) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    setPlace((prev) => ({
      ...prev,
      images: [...prev.images, data.url],
    }));
  };

  const handleSave = async () => {
    const isEdit = !!place.id;

    const res = await fetch(
      `/api/places${isEdit ? `/${place.id}` : ""}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(place),
      }
    );

    const data = await res.json();

    setPlace(data);
    alert(isEdit ? "Updated" : "Created");
  };

  return (
    <div className="text-white/80 min-h-screen">

      {/* 🖼 HERO (like your page) */}
      <div className="relative h-[85vh] w-full overflow-hidden">

        {place.images.length > 0 ? (
          place.images.map((img, i) => (
            <Image
              key={img}
              src={img}
              alt=""
              fill
              className={`object-cover transition-opacity duration-1000 ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-white/30">
            Upload images to start editing
          </div>
        )}

        {/* overlay like your page */}
        <div className="absolute inset-0 bg-black/30" />

        {/* thumbnails */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {place.images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImage(i)}
              className={`w-16 h-10 relative cursor-pointer border ${
                i === activeImage
                  ? "border-white"
                  : "border-white/30"
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* upload */}
        <div className="absolute top-4 right-4">
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

      {/* 📄 CONTENT (STYLE MATCH YOUR PAGE) */}
      <div className="px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40 backdrop-blur-md">

          <input
            className="text-4xl font-bold w-full bg-transparent outline-none"
            placeholder="Title"
            value={place.title}
            onChange={(e) =>
              setPlace({ ...place, title: e.target.value })
            }
          />

          <textarea
            className="w-full bg-transparent outline-none text-white/80 min-h-[300px]"
            placeholder="Description"
            value={place.description}
            onChange={(e) =>
              setPlace({ ...place, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4 text-sm">

            <input
              className="bg-black/30 border border-white/20 p-2"
              placeholder="Year"
              type="number"
              value={place.yearBuilt}
              onChange={(e) =>
                setPlace({
                  ...place,
                  yearBuilt: Number(e.target.value),
                })
              }
            />

            <input
              className="bg-black/30 border border-white/20 p-2"
              placeholder="Address"
              value={place.address}
              onChange={(e) =>
                setPlace({ ...place, address: e.target.value })
              }
            />

        
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4 backdrop-blur-md">

          <h3 className="text-lg font-semibold">
            Edit details
          </h3>

        <textarea
        className="w-full p-3 bg-black/30 border border-white/20 rounded-lg text-white/80 min-h-[100px] resize-none"
        placeholder="Subtitle / extended description"
        value={place.subtitle}
        onChange={(e) =>
            setPlace({ ...place, subtitle: e.target.value })
        }
        />

          <input
            className="w-full p-2 bg-black/30 border border-white/20"
            placeholder="Status"
            value={place.status}
            onChange={(e) =>
              setPlace({ ...place, status: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20"
            placeholder="Type"
            value={place.type}
            onChange={(e) =>
              setPlace({ ...place, type: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20"
            placeholder="Opening hours"
            value={place.openingHours}
            onChange={(e) =>
              setPlace({ ...place, openingHours: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20"
            placeholder="Phone"
            value={place.phone ?? ""}
            onChange={(e) =>
              setPlace({ ...place, phone: e.target.value })
            }
          />

          <input
            className="w-full p-2 bg-black/30 border border-white/20"
            placeholder="Website"
            value={place.website ?? ""}
            onChange={(e) =>
              setPlace({ ...place, website: e.target.value })
            }
          />
        </aside>
      </div>

      {/* 🗺 MAP */}
{/* 🗺 MAP + COORDINATES */}
<div className="px-12 pb-10">
  <div className="mx-auto space-y-3">

    {/* координати над картою */}
    <div className="flex gap-4 text-sm">

      <input
        className="w-full p-2 bg-black/40 border border-white/20 rounded-lg"
        placeholder="Latitude"
        type="number"
        value={place.lat ?? 49.4444}
        onChange={(e) =>
          setPlace({ ...place, lat: Number(e.target.value) })
        }
      />

      <input
        className="w-full p-2 bg-black/40 border border-white/20 rounded-lg"
        placeholder="Longitude"
        type="number"
        value={place.lng ?? 32.0598}
        onChange={(e) =>
          setPlace({ ...place, lng: Number(e.target.value) })
        }
      />
    </div>

    {/* карта */}
    <div className="h-75 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
      <Map
        lat={place.lat ?? 49.4444}
        lng={place.lng ?? 32.0598}
        title={place.title || "Cherkasy"}
      />
    </div>

  </div>
</div>

      {/* 💾 SAVE */}
      <div className="p-10 flex justify-center">
        <button
          onClick={handleSave}
          className="px-10 py-3 bg-black/30 border border-white/30 backdrop-blur-md hover:bg-white/20 transition"
        >
          {place.id ? "Update place" : "Create place"}
        </button>
      </div>
    </div>
  );
}