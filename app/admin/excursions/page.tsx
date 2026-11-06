
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Place = {
  id: number;
  title: string;
  subtitle?: string | null;
  address?: string | null;
  images?: string[];
  status?: string;
};

export type Excursion = {
  id?: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  coverImage: string;
  duration: number;
  placeIds: number[];
  status: string;
};

const EMPTY_EXCURSION: Excursion = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  coverImage: "",
  duration: 120,
  placeIds: [],
  status: "draft",
};

const STORAGE_KEY = "excursion_draft";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-white/40";

const labelClass = "mb-2 block text-sm text-white/60";

function normalizeExcursion(data: any): Excursion {
  return {
    ...EMPTY_EXCURSION,
    ...data,
    title: String(data?.title ?? ""),
    slug: String(data?.slug ?? ""),
    subtitle: String(data?.subtitle ?? ""),
    description: String(data?.description ?? ""),
    coverImage: String(data?.coverImage ?? ""),
    duration: Number(data?.duration) || 120,
    placeIds: Array.isArray(data?.placeIds)
      ? data.placeIds.map(Number).filter(Number.isFinite)
      : [],
    status: String(data?.status ?? "draft"),
  };
}

function generateSlug(value: string) {
  const transliteration: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g",
    д: "d", е: "e", є: "ye", ж: "zh", з: "z",
    и: "y", і: "i", ї: "yi", й: "y", к: "k",
    л: "l", м: "m", н: "n", о: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "kh", ц: "ts", ч: "ch", ш: "sh",
    щ: "shch", ь: "", ю: "yu", я: "ya",
    ы: "y", э: "e", ё: "yo", ъ: "",
  };

  return value
    .toLowerCase()
    .split("")
    .map((char) => transliteration[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminExcursionPage({
  initialData,
}: {
  initialData?: Excursion;
}) {
  const router = useRouter();

  const [excursion, setExcursion] = useState<Excursion>(() =>
    normalizeExcursion(initialData)
  );

  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);

  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [tempPlaceIds, setTempPlaceIds] = useState<number[]>([]);
  const [placeSearch, setPlaceSearch] = useState("");

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(initialData?.slug)
  );

  const [isClient, setIsClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const draftKey = initialData?.id
    ? `${STORAGE_KEY}_edit_${initialData.id}`
    : `${STORAGE_KEY}_new`;

  // LOAD PLACES
  useEffect(() => {
    async function loadPlaces() {
      try {
        const res = await fetch("/api/places");

        if (!res.ok) {
          throw new Error("Не вдалося завантажити місця");
        }

        const data = await res.json();

        const placesData = Array.isArray(data)
          ? data
          : Array.isArray(data?.places)
            ? data.places
            : [];

        setPlaces(placesData);
      } catch (error) {
        console.error(error);
      } finally {
        setPlacesLoading(false);
      }
    }

    loadPlaces();
  }, []);

  // RESTORE DRAFT
  useEffect(() => {
    setIsClient(true);

    try {
      const saved = localStorage.getItem(draftKey);

      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = normalizeExcursion(parsed);

        if (!initialData?.id) {
          delete (normalized as Partial<Excursion>).id;
        }

        setExcursion(normalized);
        setSlugManuallyEdited(Boolean(normalized.slug));
      } else {
        setExcursion(normalizeExcursion(initialData));
        setSlugManuallyEdited(Boolean(initialData?.slug));
      }
    } catch (error) {
      console.error("Помилка відновлення чернетки:", error);
      setExcursion(normalizeExcursion(initialData));
    }
  }, [draftKey, initialData]);

  // AUTOSAVE DRAFT
  useEffect(() => {
    if (!isClient) return;

    localStorage.setItem(draftKey, JSON.stringify(excursion));
  }, [excursion, isClient, draftKey]);

  const updateField = <K extends keyof Excursion>(
    key: K,
    value: Excursion[K]
  ) => {
    setExcursion((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // FILTER PLACES
  const filteredPlaces = useMemo(() => {
    const query = placeSearch.toLowerCase().trim();

    return places.filter((place) =>
      String(place.title ?? "").toLowerCase().includes(query)
    );
  }, [places, placeSearch]);

  // SELECTED PLACES
  const selectedPlaces = useMemo(() => {
    return excursion.placeIds
      .map((id) => places.find((place) => place.id === id))
      .filter((place): place is Place => Boolean(place));
  }, [excursion.placeIds, places]);

  // OPEN PLACE MODAL
  const openPlaceModal = () => {
    setTempPlaceIds([...excursion.placeIds]);
    setPlaceSearch("");
    setIsPlaceModalOpen(true);
  };

  // TOGGLE TEMP PLACE
  const toggleTempPlace = (id: number) => {
    setTempPlaceIds((prev) =>
      prev.includes(id)
        ? prev.filter((placeId) => placeId !== id)
        : [...prev, id]
    );
  };

  // CONFIRM PLACE SELECTION
  const confirmPlaceSelection = () => {
    setExcursion((prev) => ({
      ...prev,
      placeIds: tempPlaceIds,
    }));

    setIsPlaceModalOpen(false);
  };

  // REMOVE PLACE
  const togglePlace = (id: number) => {
    setExcursion((prev) => ({
      ...prev,
      placeIds: prev.placeIds.filter((placeId) => placeId !== id),
    }));
  };

  // MOVE PLACE
  const movePlace = (index: number, direction: -1 | 1) => {
    setExcursion((prev) => {
      const newPlaceIds = [...prev.placeIds];
      const targetIndex = index + direction;

      if (
        targetIndex < 0 ||
        targetIndex >= newPlaceIds.length
      ) {
        return prev;
      }

      [newPlaceIds[index], newPlaceIds[targetIndex]] = [
        newPlaceIds[targetIndex],
        newPlaceIds[index],
      ];

      return {
        ...prev,
        placeIds: newPlaceIds,
      };
    });
  };

  // UPLOAD COVER
  const uploadCover = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);

    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      if (data.urls?.[0]) {
        updateField("coverImage", data.urls[0]);
      }
    } catch (error) {
      console.error(error);
      alert("Помилка завантаження обкладинки");
    } finally {
      setUploading(false);
    }
  };

  // SAVE EXCURSION
  const handleSave = async () => {
    const title = String(excursion.title ?? "").trim();
    const slug = String(excursion.slug ?? "").trim();
    const description = String(excursion.description ?? "").trim();

    if (!title) {
      alert("Введіть назву екскурсії");
      return;
    }

    if (!slug) {
      alert("Введіть slug екскурсії");
      return;
    }

    if (!description) {
      alert("Введіть опис екскурсії");
      return;
    }

    if (saving) return;

    setSaving(true);

    const isEdit = Boolean(excursion.id);

    const dataToSend = {
      ...excursion,
      title,
      slug,
      subtitle: String(excursion.subtitle ?? "").trim(),
      description,
      coverImage:
        String(excursion.coverImage ?? "").trim() || null,
      duration: Math.max(
        1,
        Number(excursion.duration) || 120
      ),
      placeIds: (Array.isArray(excursion.placeIds)
        ? excursion.placeIds
        : []
      )
        .map(Number)
        .filter(Number.isFinite),
      status: excursion.status || "draft",
    };

    try {
      const res = await fetch(
        `/api/excursions${isEdit ? `/${excursion.id}` : ""}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();

        console.error("API ERROR:", errorText);

        alert("Помилка збереження екскурсії");
        return;
      }

      const data = await res.json();

      localStorage.removeItem(draftKey);

      alert(
        isEdit
          ? "Екскурсію оновлено"
          : "Екскурсію створено"
      );

      if (!isEdit && data.id) {
        router.push(`/admin/excursions/${data.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Помилка мережі");
    } finally {
      setSaving(false);
    }
  };

  // CLEAR DRAFT
  const clearDraft = () => {
    if (!confirm("Видалити всі незбережені зміни?")) return;

    localStorage.removeItem(draftKey);

    setExcursion(normalizeExcursion(initialData));

    setSlugManuallyEdited(Boolean(initialData?.slug));
  };

  return (
    <div className="min-h-screen px-5 py-10 text-white/80 md:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/40">
              Administration / Excursions
            </p>

            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {excursion.id
                ? "Редагування екскурсії"
                : "Нова екскурсія"}
            </h1>

            <p className="mt-3 text-white/50">
              Створення туристичного маршруту містом
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/tableexc")}
              className="rounded-xl border border-white/15 px-5 py-3 transition hover:bg-white/10"
            >
              До списку
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-white/80 disabled:opacity-50"
            >
              {saving
                ? "Збереження..."
                : excursion.id
                  ? "Зберегти зміни"
                  : "Створити екскурсію"}
            </button>
          </div>
        </div>

        {/* COVER */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30">
          <div className="relative flex min-h-[320px] items-center justify-center md:min-h-[420px]">
            {excursion.coverImage ? (
              <img
                src={excursion.coverImage}
                alt={excursion.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/30">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>

                <span>Обкладинка екскурсії</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 px-5 text-center">
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-white/60">
                Cherkasy Tourism
              </p>

              <h2 className="text-4xl font-bold text-white md:text-7xl">
                {excursion.title || "Назва екскурсії"}
              </h2>

              <p className="mt-4 text-white/70">
                {excursion.subtitle || "Підзаголовок"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute right-4 top-4 z-20 rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-sm text-white backdrop-blur-md transition hover:bg-black/70 disabled:opacity-50"
            >
              {uploading
                ? "Завантаження..."
                : "Змінити обкладинку"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) uploadCover(file);

                e.target.value = "";
              }}
            />
          </div>
        </section>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* MAIN */}
          <section className="space-y-6 rounded-3xl border border-white/10 bg-black/20 p-6 lg:col-span-2">
            <div>
              <label className={labelClass}>
                Назва екскурсії
              </label>

              <input
                className={inputClass}
                placeholder="Наприклад, Історичні Черкаси"
                value={excursion.title}
                onChange={(e) => {
                  const title = e.target.value;

                  setExcursion((prev) => ({
                    ...prev,
                    title,
                    slug: slugManuallyEdited
                      ? prev.slug
                      : generateSlug(title),
                  }));
                }}
              />
            </div>

            <div>
              <label className={labelClass}>
                Slug (URL)
              </label>

              <div className="flex items-center gap-2">
                <span className="text-sm text-white/30">
                  /excursions/
                </span>

                <input
                  className={inputClass}
                  placeholder="istorichni-cherkasy"
                  value={excursion.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    updateField(
                      "slug",
                      generateSlug(e.target.value)
                    );
                  }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Опис екскурсії
              </label>

              <textarea
                className={`${inputClass} min-h-[320px] resize-y`}
                placeholder="Розкажіть про маршрут, його особливості та цікаві місця..."
                value={excursion.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
              />
            </div>
          </section>

          {/* SIDEBAR */}
          <aside className="space-y-6 rounded-3xl border border-white/10 bg-black/20 p-6">
            <h3 className="text-lg font-semibold text-white">
              Параметри
            </h3>

            <div>
              <label className={labelClass}>
                Підзаголовок
              </label>

              <textarea
                className={`${inputClass} min-h-[100px] resize-y`}
                placeholder="Короткий опис"
                value={excursion.subtitle}
                onChange={(e) =>
                  updateField("subtitle", e.target.value)
                }
              />
            </div>

            <div>
              <label className={labelClass}>
                Тривалість (хвилини)
              </label>

              <input
                className={inputClass}
                type="number"
                min={1}
                value={excursion.duration}
                onChange={(e) =>
                  updateField(
                    "duration",
                    Number(e.target.value)
                  )
                }
              />

              <p className="mt-2 text-xs text-white/35">
                {Math.floor(excursion.duration / 60)} год.{" "}
                {excursion.duration % 60} хв.
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Статус
              </label>

              <select
                className={inputClass}
                value={excursion.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
                }
              >
                <option value="draft">Чернетка</option>
                <option value="published">Опублікована</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Обкладинка (URL)
              </label>

              <input
                className={inputClass}
                placeholder="/uploads/cover.jpg"
                value={excursion.coverImage}
                onChange={(e) =>
                  updateField("coverImage", e.target.value)
                }
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-widest text-white/40">
                Маршрут
              </p>

              <p className="mt-2 text-3xl font-semibold text-white">
                {excursion.placeIds.length}
              </p>

              <p className="text-sm text-white/50">
                місць у маршруті
              </p>
            </div>
          </aside>
        </div>

        {/* ROUTE BUILDER */}
        <section className="space-y-6 rounded-3xl border border-white/10 bg-black/20 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                Route builder
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-white">
                Маршрут екскурсії
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Додавай місця та визначай порядок їх відвідування.
              </p>
            </div>

            <div className="text-sm text-white/50">
              Вибрано: {excursion.placeIds.length}
            </div>
          </div>

          {/* SELECTED PLACES */}
          <div className="space-y-3">
            {selectedPlaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/35">
                Маршрут поки порожній. Додай місця нижче.
              </div>
            ) : (
              selectedPlaces.map((place, index) => (
                <div
                  key={place.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-semibold text-white">
                    {index + 1}
                  </div>

                  {place.images?.[0] ? (
                    <img
                      src={place.images[0]}
                      alt={place.title}
                      className="h-14 w-20 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-20 shrink-0 rounded-xl bg-white/5" />
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-white">
                      {place.title}
                    </h3>

                    {place.address && (
                      <p className="mt-1 truncate text-xs text-white/40">
                        {place.address}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => movePlace(index, -1)}
                      disabled={index === 0}
                      title="Перемістити вгору"
                      className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/10 disabled:opacity-20"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() => movePlace(index, 1)}
                      disabled={index === selectedPlaces.length - 1}
                      title="Перемістити вниз"
                      className="rounded-lg border border-white/10 px-3 py-2 transition hover:bg-white/10 disabled:opacity-20"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePlace(place.id)}
                      title="Видалити з маршруту"
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-red-400 transition hover:bg-red-500/10"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* OPEN SELECTOR */}
          <div className="border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={openPlaceModal}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] p-5 transition hover:border-white/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  +
                </div>

                <div className="text-left">
                  <p className="font-medium text-white">
                    Вибрати місця маршруту
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    Оберіть місця, які увійдуть до екскурсії
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/70">
                  {excursion.placeIds.length} вибрано
                </span>

                <span className="text-xl text-white/40 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap justify-center gap-4 pb-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-white px-10 py-4 font-medium text-black transition hover:bg-white/80 disabled:opacity-50"
          >
            {saving
              ? "Збереження..."
              : excursion.id
                ? "Оновити екскурсію"
                : "Створити екскурсію"}
          </button>

          <button
            type="button"
            onClick={clearDraft}
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-8 py-4 text-red-400 transition hover:bg-red-500/20"
          >
            Очистити чернетку
          </button>
        </div>
      </div>

      {/* PLACE SELECTION MODAL */}
      {isPlaceModalOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setIsPlaceModalOpen(false)}
        >
          <div
            className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-2xl"
            style={{ height: "min(850px, 90vh)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="border-b border-white/10 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/35">
                    Route builder
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
                    Вибір місць
                  </h2>

                  <p className="mt-2 text-sm text-white/45">
                    Виберіть декілька місць для майбутнього маршруту
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  aria-label="Закрити"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-xl text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>

              {/* SEARCH */}
              <div className="relative mt-6">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>

                <input
                  autoFocus
                  type="text"
                  value={placeSearch}
                  onChange={(e) => setPlaceSearch(e.target.value)}
                  placeholder="Пошук місця..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-4 pl-12 pr-4 text-white outline-none placeholder:text-white/30 transition focus:border-white/25"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-white/40">
                  Доступно місць: {filteredPlaces.length}
                </span>

                <span className="text-sm text-white">
                  Вибрано: {tempPlaceIds.length}
                </span>
              </div>
            </div>

            {/* MODAL GRID */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {placesLoading ? (
                <div className="flex h-full items-center justify-center text-white/40">
                  Завантаження місць...
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="flex h-full items-center justify-center text-white/40">
                  Місць не знайдено
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredPlaces.map((place) => {
                    const selected = tempPlaceIds.includes(place.id);

                    return (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => toggleTempPlace(place.id)}
                        aria-pressed={selected}
                        className={`group relative aspect-square overflow-hidden rounded-2xl border transition-all duration-200 ${
                          selected
                            ? "border-white ring-2 ring-white/30"
                            : "border-white/10 hover:border-white/40"
                        }`}
                      >
                        {place.images?.[0] ? (
                          <img
                            src={place.images[0]}
                            alt={place.title}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                            <svg
                              className="h-10 w-10 text-white/20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}

                        <div
                          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10 transition ${
                            selected
                              ? "from-black/95"
                              : "group-hover:from-black/95"
                          }`}
                        />

                        <div className="absolute inset-x-0 bottom-0 p-3 text-left">
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-white md:text-base">
                            {place.title}
                          </p>
                        </div>

                        <div
                          className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border transition ${
                            selected
                              ? "border-white bg-white text-black"
                              : "border-white/50 bg-black/30 text-transparent"
                          }`}
                        >
                          {selected && (
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="m5 12 4 4L19 6" />
                            </svg>
                          )}
                        </div>

                        {selected && (
                          <div className="pointer-events-none absolute inset-0 bg-white/5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex flex-col gap-4 border-t border-white/10 bg-[#111214] p-5 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <p className="text-sm font-medium text-white">
                  {tempPlaceIds.length} місць вибрано
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Порядок відвідування можна змінити після підтвердження
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="rounded-xl border border-white/15 px-5 py-3 text-sm transition hover:bg-white/10"
                >
                  Скасувати
                </button>

                <button
                  type="button"
                  onClick={confirmPlaceSelection}
                  className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/80"
                >
                  Підтвердити вибір
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
