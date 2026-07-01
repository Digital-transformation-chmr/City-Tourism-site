'use client';

import Link from "next/link";
import { Logo } from "./logo";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const Header = () => {
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();
  
  // Рефи для анімації
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

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

  // КЕРУВАННЯ АНІМАЦІЄЮ ЧЕРЕЗ useGSAP
const tl = useRef<gsap.core.Timeline | null>(null);

useEffect(() => {
  if (!tl.current) return;

  if (menuOpen) {
    tl.current.play();
  } else {
    tl.current.reverse();
  }
}, [menuOpen]);

useGSAP(() => {
  tl.current = gsap.timeline({ paused: true });

  tl.current
    .to(line1Ref.current, {
      y: 8,
      rotate: 45,
      duration: 0.3,
      ease: "power2.out",
    }, 0)
    .to(line2Ref.current, {
      opacity: 0,
      scaleX: 0,
      duration: 0.2,
      ease: "power2.out",
    }, 0)
    .to(line3Ref.current, {
      y: -8,
      rotate: -45,
      duration: 0.3,
      ease: "power2.out",
    }, 0)
    .to(menuRef.current, {
      height: "auto",
      opacity: 1,
      duration: 0.4,
      ease: "power3.out",
    }, 0);

  const links = menuRef.current?.querySelectorAll(".mobile-link");

  if (links?.length) {
    tl.current.fromTo(
      links,
      {
        x: 50,
        opacity: 0,
      },
      {
        x: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.3,
      },
      "-=0.2"
    );
  }
}, { scope: headerRef });

  const navItems = [
    { href: "/Attractions", label: "Куди піти?" },
    { href: "/WhereToEat", label: "Де поїсти?" },
    { href: "/Hotels", label: "Де зупинитись?" },
    { href: "/InteractiveMap", label: "Інтерактивна карта" },
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed z-50 backdrop-blur-md bg-black/40 border border-white/20 shadow-lg transition-all duration-300 ease-in-out z-100
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
          className="md:hidden flex flex-col justify-center items-center h-10 w-10 p-2 relative z-50 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {/* Смужки тепер мають рефи і керуються виключно через GSAP */}
          <span ref={line1Ref} className="block w-6 h-0.5 bg-white will-change-transform" />
          <span ref={line2Ref} className="block w-6 h-0.5 bg-white my-1.5 will-change-transform" />
          <span ref={line3Ref} className="block w-6 h-0.5 bg-white will-change-transform" />
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        ref={menuRef}
        className="md:hidden overflow-hidden h-0 opacity-0 border-white/10"
        style={{ borderTopWidth: menuOpen ? '1px' : '0px' }}
      >
        <nav className="flex flex-col px-8 py-4 gap-4">
          {navItems.map((item) => {
            const isActive = pathname === "/site" + item.href;

            return (
              <Link
                key={item.href}
                href={"/site" + item.href}
                onClick={() => setMenuOpen(false)}
                className={`mobile-link font-bold opacity-0 will-change-transform block py-1 text-lg
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