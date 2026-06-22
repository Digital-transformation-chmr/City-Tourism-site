'use client'

import Link from "next/link";
import { Logo } from "./logo";
import { useEffect, useState } from "react";

const Header = () => {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const navItems = [{ href: "/Attractions", label: "Пам'ятки" },
    { href: "/WhereToEat", label: "Де поїсти?" },
    { href: "/Hotels", label: "Готелі" },
    { href: "/InteractiveMap", label: "Інтерактивна карта" },
  
  ];

  return (
    <header
      className={`fixed z-50 backdrop-blur-md bg-black/40 border border-white/20 shadow-lg transition-all duration-300 ease-in-out
        ${scrolled
          ? "top-4 left-4 right-4 rounded-2xl"        // острівець
          : "top-0 left-0 right-0 rounded-none"        // на весь екран
        }
      `}
    >
      <div className="w-full px-8 py-2 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex gap-6 font-bold font-heading items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={"/site/"+item.href}
              className="text-white/90 hover:underline!"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;