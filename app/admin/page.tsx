
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Place } from "../components/Places/placeCard";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Users,
  KeyRound,
} from "lucide-react";

export default function AdminHome() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch("/api/places", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Не вдалося завантажити місця");
        }

        const data = await response.json();
        setPlaces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--paper-l)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                <span className="h-px w-8 bg-[var(--accent)]" />
                Admin Panel
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Адміністративна панель
              </h1>

              <p className="mt-3 text-base text-[var(--ink)]/60 md:text-lg">
                Керування туристичними місцями Черкас
              </p>
            </div>

            <div className="hidden items-center gap-2 text-sm text-[var(--ink)]/50 md:flex">
              <MapPin size={16} />
              Черкаси
            </div>
          </div>
        </header>

        {/* Main actions */}
        <section className="mb-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* Створити */}
            <Link
              href="/admin/edit"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-700">
                  <Plus size={24} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--ink)]"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">Створити</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Додати нове туристичне місце до системи
              </p>
            </Link>

            {/* Редагувати */}
            <Link
              href="/admin/select"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                  <Pencil size={22} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--ink)]"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">Редагувати</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Змінити інформацію про існуюче місце
              </p>
            </Link>

            {/* Видалити */}
            <Link
              href="/admin/select?mode=delete"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-red-400/70 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-700">
                  <Trash2 size={22} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-red-700"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">Видалити</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Видалити туристичне місце із системи
              </p>
            </Link>

            {/* Feedback */}
            <Link
              href="/admin/feedback"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/70 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                  <MessageCircle size={23} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-violet-700"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">
                Зворотний зв'язок
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Переглянути звернення користувачів
              </p>
            </Link>

            {/* Користувачі */}
            <Link
              href="/admin/users"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-700">
                  <Users size={23} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--ink)]"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">Користувачі</h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Керування обліковими записами адміністраторів
              </p>
            </Link>

            {/* Зміна пароля */}
            <Link
              href="/admin/change-password"
              className="group relative overflow-hidden rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/70 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700">
                  <KeyRound size={23} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-[var(--ink)]/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-violet-700"
                />
              </div>

              <h2 className="mt-6 text-xl font-semibold">
                Змінити пароль
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink)]/55">
                Змінити власний пароль адміністратора
              </p>
            </Link>
          </div>
        </section>

        {/* Statistics */}
        <section>
          <div className="mb-5 flex items-center gap-4">
            <h2 className="text-xl font-semibold">Статистика</h2>
            <div className="h-px flex-1 bg-[var(--rule)]" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {/* Places */}
            <div className="rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                  <MapPin size={20} />
                </div>

                <span className="text-xs uppercase tracking-wider text-[var(--ink)]/40">
                  Places
                </span>
              </div>

              <div className="mt-5">
                <div className="text-3xl font-bold">
                  {loading ? "—" : places.length}
                </div>

                <div className="mt-1 text-sm text-[var(--ink)]/50">
                  Всього місць
                </div>
              </div>
            </div>

            {/* Статус */}
            <div className="rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                </div>

                <span className="text-xs uppercase tracking-wider text-[var(--ink)]/40">
                  Status
                </span>
              </div>

              <div className="mt-5">
                <div className="text-3xl font-bold">Онлайн</div>

                <div className="mt-1 text-sm text-[var(--ink)]/50">
                  Система працює
                </div>
              </div>
            </div>

            {/* API */}
            <div className="rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-700">
                  <span className="text-sm font-bold">API</span>
                </div>

                <span className="text-xs uppercase tracking-wider text-[var(--ink)]/40">
                  Backend
                </span>
              </div>

              <div className="mt-5">
                <div className="text-3xl font-bold">Active</div>

                <div className="mt-1 text-sm text-[var(--ink)]/50">
                  API доступне
                </div>
              </div>
            </div>

            {/* Admin */}
            <div className="rounded-2xl border border-[var(--rule)] bg-[var(--paper-r)] p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-700">
                  <span className="text-sm font-bold">✓</span>
                </div>

                <span className="text-xs uppercase tracking-wider text-[var(--ink)]/40">
                  Access
                </span>
              </div>

              <div className="mt-5">
                <div className="text-3xl font-bold">Admin</div>

                <div className="mt-1 text-sm text-[var(--ink)]/50">
                  Режим адміністрування
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 border-t border-[var(--rule)] pt-6">
          <p className="text-xs text-[var(--ink)]/40">
            Панель керування туристичним порталом Черкас
          </p>
        </div>
      </div>
    </div>
  );
}
