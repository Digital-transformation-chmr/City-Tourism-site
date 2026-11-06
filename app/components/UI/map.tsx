
"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Map as LeafletMap,
  LayerGroup,
  Layer,
} from "leaflet";

type MapPoint = {
  id: number;
  lat: number;
  lng: number;
  title: string;
};

type MapProps = {
  lat?: number;
  lng?: number;
  title?: string;
  zoom?: number;
  id?: string;
  points?: MapPoint[];
  onLocationSelect?: (lat: number, lng: number) => void;
};

type OSRMResponse = {
  code: string;
  message?: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: GeoJSON.LineString;
  }[];
};

export default function Map({
  lat,
  lng,
  title = "Місце",
  zoom = 15,
  id,
  points = [],
  onLocationSelect,
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const routeRef = useRef<Layer | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const validPoints = points.filter(
    (point) =>
      Number.isFinite(point.lat) &&
      Number.isFinite(point.lng) &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180
  );

  const isRouteMode = validPoints.length > 0;

  // Ініціалізація карти
  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = await import("leaflet");

      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [49.4444, 32.0622],
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }
      ).addTo(map);

      const markers = L.layerGroup().addTo(map);

      mapRef.current = map;
      markersRef.current = markers;

      map.on("click", (event) => {
        onLocationSelect?.(
          event.latlng.lat,
          event.latlng.lng
        );
      });

      requestAnimationFrame(() => {
        if (!cancelled) {
          map.invalidateSize();
          setMapReady(true);
        }
      });
    };

    initializeMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        routeRef.current = null;
      }

      setMapReady(false);
    };
  }, []);

  // Побудова маршруту після готовності карти
  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    const markers = markersRef.current;

    if (!map || !markers) return;

    let cancelled = false;
    const controller = new AbortController();

    const updateMap = async () => {
      const L = await import("leaflet");

      if (cancelled) return;

      markers.clearLayers();

      if (routeRef.current) {
        map.removeLayer(routeRef.current);
        routeRef.current = null;
      }

      setRouteInfo(null);
      setRouteError("");

      // Режим однієї точки
      if (!isRouteMode) {
        if (
          lat !== undefined &&
          lng !== undefined &&
          Number.isFinite(lat) &&
          Number.isFinite(lng) &&
          Math.abs(lat) <= 90 &&
          Math.abs(lng) <= 180
        ) {
          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "custom-pin",
              html: `
                <div style="
                  width: 32px;
                  height: 32px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  background: #263b35;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,.25);
                  position: relative;
                ">
                  <div style="
                    width: 10px;
                    height: 10px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 8px;
                    left: 8px;
                  "></div>
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            }),
          });

          marker.bindPopup(`<b>${title}</b>`);
          markers.addLayer(marker);

          map.setView([lat, lng], zoom);
        }

        return;
      }

      // Нумеровані маркери
      const markerIcon = (number: number) =>
        L.divIcon({
          className: "",
          html: `
            <div style="
              width: 34px;
              height: 34px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              background: #263b35;
              color: white;
              border: 3px solid white;
              box-shadow: 0 2px 9px rgba(0,0,0,.25);
              font-size: 14px;
              font-weight: 700;
            ">
              ${number}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

      validPoints.forEach((point, index) => {
        const marker = L.marker(
          [point.lat, point.lng],
          {
            icon: markerIcon(index + 1),
          }
        );

        marker.bindPopup(`
          <div style="min-width:150px">
            <strong>${index + 1}. ${point.title}</strong>
          </div>
        `);

        markers.addLayer(marker);
      });

      // Одна точка — без маршруту
      if (validPoints.length === 1) {
        map.setView(
          [validPoints[0].lat, validPoints[0].lng],
          zoom
        );
        return;
      }

      // Пішохідний маршрут OSRM
      setLoading(true);

      try {
        const coordinates = validPoints
          .map((point) => `${point.lng},${point.lat}`)
          .join(";");

        const url =
          `https://routing.openstreetmap.de/routed-foot/route/v1/driving/${coordinates}` +
          "?overview=full&geometries=geojson&steps=false";

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Помилка сервера маршрутизації: ${response.status}`
          );
        }

        const data: OSRMResponse = await response.json();

        if (cancelled) return;

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error(
            data.message || "Маршрут між цими точками не знайдено"
          );
        }

        const route = data.routes[0];

        const routeLayer = L.geoJSON(route.geometry, {
          style: {
            color: "#263b35",
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          },
        });

        routeLayer.addTo(map);
        routeRef.current = routeLayer;

        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
        });

        const bounds = routeLayer.getBounds();

        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 16,
          });
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        console.error("Помилка побудови маршруту:", error);

        if (!cancelled) {
          setRouteError(
            error instanceof Error
              ? error.message
              : "Не вдалося побудувати маршрут"
          );

          const bounds = L.latLngBounds(
            validPoints.map((point) => [
              point.lat,
              point.lng,
            ])
          );

          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 16,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    updateMap();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mapReady, lat, lng, title, zoom, points]);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} км`;
    }

    return `${Math.round(meters)} м`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);

    if (minutes < 60) {
      return `${minutes} хв`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes
      ? `${hours} год ${remainingMinutes} хв`
      : `${hours} год`;
  };

  return (
    <div
      id={id}
      className="relative w-full h-full min-h-[300px] overflow-hidden rounded-xl"
    >
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px] z-0"
      />

      {isRouteMode && (
        <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-2">
          {loading && (
            <div className="rounded-lg bg-white px-4 py-2 shadow-md text-sm text-gray-700">
              Будуємо маршрут...
            </div>
          )}

          {routeInfo && !loading && (
            <div className="rounded-lg bg-white px-4 py-3 shadow-md">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500">
                    Відстань
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatDistance(routeInfo.distance)}
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200" />

                <div>
                  <div className="text-xs text-gray-500">
                    Пішки
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatDuration(routeInfo.duration)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {routeError && (
            <div className="max-w-[260px] rounded-lg bg-white px-4 py-3 shadow-md">
              <div className="text-sm font-medium text-red-600">
                Не вдалося побудувати маршрут
              </div>
              <div className="mt-1 text-xs text-gray-600">
                {routeError}
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Показано розташування зупинок без маршруту.
              </div>
            </div>
          )}
        </div>
      )}

      {isRouteMode && (
        <div className="absolute bottom-2 right-2 z-[1000] rounded bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow">
          Маршрут: OpenStreetMap / OSRM
        </div>
      )}
    </div>
  );
}
