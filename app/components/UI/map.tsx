"use client";

import { useEffect, useRef } from "react";

type MapProps = {
  lat: number;
  lng: number;
  title?: string;
  zoom?: number;
  id?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
};

export default function Map({
  lat,
  lng,
  title = "Місце",
  id = "map",
  zoom = 15,
  onLocationSelect,
}: MapProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");

      // якщо ефект вже "скасований" (StrictMode / повторний рендер / розмонтування) — виходимо
      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;

      // головний guard: якщо на цьому DOM-елементі вже є карта — знищуємо її перед новою ініціалізацією
      if ((container as any)._leaflet_id) {
        mapRef.current?.remove();
        (container as any)._leaflet_id = null;
      }

      const mapInstance = L.map(container, {
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapInstance);

      const pinIcon = L.divIcon({
        className: "custom-pin",
        html: `
          <div class="pin">
            <div class="pin-dot"></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      const marker = L.marker([lat, lng], { icon: pinIcon })
        .addTo(mapInstance)
        .bindPopup(title);

      mapInstance.on("click", (e: any) => {
        onLocationSelect?.(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapRef.current = mapInstance;
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.panTo([lat, lng]);
  }, [lat, lng]);

  useEffect(() => {
    if (!markerRef.current) return;
    markerRef.current.setPopupContent(title || "Місце");
  }, [title]);

  return (
    <div
      ref={containerRef}
      id={id}
      className="w-full h-full z-0"
      style={{ pointerEvents: "auto" }}
    />
  );
}