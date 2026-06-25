'use client';

import Link from "next/link";
import { Logo } from "./logo";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/Attractions", label: "Пам'ятки" },
    { href: "/WhereToEat", label: "Де поїсти?" },
    { href: "/Hotels", label: "Готелі" },
    { href: "/InteractiveMap", label: "Інтерактивна карта" },
  ];

  return (
    <header
      className={`fixed z-50 backdrop-blur-md bg-black/40 border border-white/20 shadow-lg transition-all duration-300 ease-in-out
        ${
          scrolled
            ? "top-4 left-4 right-4 rounded-2xl"
            : "top-0 left-0 right-0 rounded-none"
        }
      `}
    >
      <div className="w-full px-8 py-2 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 font-bold font-heading items-center">
          {navItems.map((item) => {
            const isActive = pathname === "/site" + item.href;

            return (
              <Link
                key={item.href}
                href={"/site" + item.href}
                className={`relative transition
                  ${
                    isActive
                      ? "text-red-400"
                      : "text-white/90 hover:text-red-200"
                  }
                `}
              >
                {item.label}

                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-[var(--accent)] rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Burger Button */}
        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-8 py-4 gap-4">
          {navItems.map((item) => {
            const isActive = pathname === "/site" + item.href;

            return (
              <Link
                key={item.href}
                href={"/site" + item.href}
                onClick={() => setMenuOpen(false)}
                className={`font-bold transition
                  ${
                    isActive
                      ? "text-red-400"
                      : "text-white hover:text-red-200"
                  }
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;