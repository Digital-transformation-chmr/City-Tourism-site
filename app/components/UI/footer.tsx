"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { motion } from "motion/react"
import { Send, MapPin, Mail, ArrowUpRight } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const navLinks = [
    { label: "Місця", href: "/site/Attractions" },
  ]
  const channel = process.env.NEXT_PUBLIC_TG_CHANNEL || "kudypityCherkasy";
  return (
    <footer className="relative w-full overflow-hidden border-t border-[oklch(0.9_0.02_250)] bg-white">
      {/* легке декоративне світіння, як у хіро-секції, але приглушене */}
      <div className="pointer-events-none absolute  h-72 w-72 rounded-full bg-[oklch(0.55_0.19_25)]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute  h-72 w-72 rounded-full bg-[oklch(0.42_0.13_250)]/[0.08] blur-3xl" />

      <div className="relative z-10 mx-auto px-10 mx-2 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr]">
          {/* Логотип + опис */}
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Logo />
              <span className="font-['Unbounded'] text-xl font-bold text-[oklch(0.22_0.05_250)]">
                CheTour
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[oklch(0.45_0.03_250)]">
              Козацька історія, набережна Дніпра та тепла атмосфера — відкрий
              Черкаси по-новому разом з нами.
            </p>

            <motion.a
              href={`https://t.me/${channel}`}
              target="_blank"
              whileHover={{ x: 4 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[oklch(0.93_0.03_250)] px-4 py-2 text-sm font-medium text-[oklch(0.32_0.11_250)] transition-colors hover:bg-[oklch(0.42_0.13_250)] hover:text-white"
            >
              <Send size={16} />
              Наш Telegram
            </motion.a>
          </div>

          {/* Навігація */}
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[oklch(0.55_0.19_25)]">
              Навігація
            </p>
            <nav className="flex flex-col gap-3 text-sm text-[oklch(0.4_0.04_250)]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex w-fit items-center gap-1 transition-colors hover:text-[oklch(0.22_0.05_250)]"
                >
                  {link.label}
                  <ArrowUpRight
                    size={14}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
              ))}
            </nav>
          </div>

          {/* Контакти */}
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[oklch(0.55_0.19_25)]">
              Контакти
            </p>
            <div className="flex flex-col gap-3 text-sm text-[oklch(0.4_0.04_250)]">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[oklch(0.55_0.19_25)]" />
                <span>м. Черкаси, Україна</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[oklch(0.55_0.19_25)]" />
                <span>hello@chetour.ua</span>
              </div>
            </div>
          </div>
        </div>

        {/* Розділювач */}
        <div className="my-10 h-px w-full bg-[oklch(0.9_0.02_250)]" />

        {/* Нижня частина */}
        <div className="flex flex-col gap-3 text-xs text-[oklch(0.55_0.02_250)] md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} CheTour. Усі права захищено.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="transition-colors hover:text-[oklch(0.22_0.05_250)]">
              Приватність
            </a>
            <a href="#terms" className="transition-colors hover:text-[oklch(0.22_0.05_250)]">
              Умови
            </a>
          </div>
          <p>Зроблено з ❤️ в Україні</p>
        </div>
      </div>
    </footer>
  )
}