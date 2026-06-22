"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Place } from "../components/Places/placeCard";

export default function AdminHome() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загрузите ваши місця звідси
    const fetchPlaces = async () => {
      try {
        const response = await fetch("/api/places");
        const data = await response.json();
        setPlaces(data);
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <div className="min-h-scree text-white overflow-hidden">
      {/* Фонові декорації */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Адміністративна Панель
          </h1>
          <p className="text-(--text) text-lg">
            Керування місцинами Черкас
          </p>
        </div>

        {/* Головне меню */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Кнопка створити */}
          <Link
            href="/admin/edit"
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 hover:border-green-400/60 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-400/0 group-hover:from-green-500/10 group-hover:to-green-400/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-2xl font-bold mb-2">Створити</h3>
              <p className="text-(--text) text-sm">
                Додати нове місце у систему
              </p>
            </div>
          </Link>

          {/* Кнопка редагувати */}
          <Link
            href="/admin/select"
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-400/0 group-hover:from-blue-500/10 group-hover:to-blue-400/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="text-4xl mb-3">✏️</div>
              <h3 className="text-2xl font-bold mb-2">Редагувати</h3>
              <p className="text-(--text) text-sm">
                Змінити існуюче місце
              </p>
            </div>
          </Link>

          {/* Кнопка видалити */}
          <Link
            href="/admin/select?mode=delete"
            className="group relative p-8 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 border border-red-500/30 hover:border-red-400/60 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-400/0 group-hover:from-red-500/10 group-hover:to-red-400/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-2xl font-bold mb-2">Видалити</h3>
              <p className="text-(--text) text-sm">
                Видалити місце з системи
              </p>
            </div>
          </Link>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {places.length}
            </div>
            <div className="text-(--text-light) text-sm mt-2">Всього місць</div>
          </div>

        </div>

    
                   
        </div>
      </div>
  );
}
