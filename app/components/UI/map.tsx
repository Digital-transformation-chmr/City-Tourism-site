"use client";

import { useEffect, useRef } from "react";

type MapProps = {
  lat: number;
  lng: number;
  title?: string;
  zoom?: number;
  id?: string; // Використовуємо цей ID
  onLocationSelect?: (lat: number, lng: number) => void;
};

export default function Map({
  lat,
  lng,
  title = "Місце",
  id = "map", // Значення за замовчуванням, якщо id не передано
  zoom = 15,
  onLocationSelect,
}: MapProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // ✅ Ініціалізація карти та правильне очищення
  useEffect(() => {
    let mapInstance: any = null;

    const initMap = async () => {
      const L = await import("leaflet");

      // Ініціалізуємо карту саме на динамічному ID
      mapInstance = L.map(id, {
        zoomControl: true, // Можна увімкнути для зручності, як у Google Maps
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapInstance);

      // Створюємо маркер
      const pinIcon = L.divIcon({
        className: "custom-pin",
        html: `
          <div class="pin">
            <div class="pin-dot"></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42], // Центруємо низ маркера по точці
      });

      const marker = L.marker([lat, lng], { icon: pinIcon })
        .addTo(mapInstance)
        .bindPopup(title);

      markerRef.current = marker;
      mapRef.current = mapInstance;

      // Обробляємо клік
      mapInstance.on("click", (e: any) => {
        onLocationSelect?.(e.latlng.lat, e.latlng.lng);
      });
    };

    initMap();

    // ✅ Очищення: коли компонент видаляється (або змінюється id), повністю видаляємо карту
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [id]); // Перестворюємо карту ТІЛЬКИ якщо змінився ID контейнера

  // ✅ Оновлюємо маркер та позицію при змінах lat/lng без перестворення всієї карти
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.panTo([lat, lng]); // Плавно рухає карту до нової точки
  }, [lat, lng]);

  // ✅ Оновлюємо текст попапу
  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setPopupContent(title || "Місце");
  }, [title]);

  return (
    <div
      id={id} // 🔥 Передаємо динамічний ID в HTML!
      className="w-full h-full z-0"
      style={{
        pointerEvents: "auto",
      }}
    />
  );
}