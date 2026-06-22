"use client";

import { useEffect } from "react";

type MapProps = {
  lat: number;
  lng: number;
  title?: string;
  zoom?: number;
};

export default function Map({
  lat,
  lng,
  title = "Місце",
  zoom = 15,
}: MapProps) {
  useEffect(() => {
    let map: any;

    const initMap = async () => {
      const L = await import("leaflet");

      const container = L.DomUtil.get("map");

      if (container && (container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
      }

      map = L.map("map", {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lng], zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "custom-pin",
        html: `
          <div class="pin">
            <div class="pin-dot"></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [10, 30],
      });

      L.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(title);
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [lat, lng, title, zoom]);

  return (
    <div
      id="map"
      className="w-full h-75 z-10 rounded-xl border border-white/10"
    />
  );
}