"use client";

import Link from "next/link";
import { Identity } from "./identity";
import { useEffect, useRef, useState } from "react";
import { Houses } from "./houses";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BREAKPOINT_PX = 1100;

const navItems = [
  { href: "/Attractions", label: "Куди піти?" },
  { href: "/WhereToEat", label: "Де поїсти?" },
  { href: "/Hotels", label: "Де зупинитись?" },
  { href: "/InteractiveMap", label: "Інтерактивна карта" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const pathname = usePathname();

  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  const tl = useRef<gsap.core.Timeline | null>(null);

  // -----------------------------
  // BREAKPOINT TRACKING
  // -----------------------------
  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINT_PX - 1}px)`);
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  // -----------------------------
  // SCROLL
  // -----------------------------
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // -----------------------------
  // THEME
  // -----------------------------
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // -----------------------------
  // GSAP MOBILE MENU
  // -----------------------------
  useGSAP(
    () => {
      // Створюємо таймлайн тільки якщо це мобільний режим і DOM-елемент меню вже є
      if (!isMobile || !menuRef.current) return;

      tl.current = gsap.timeline({ paused: true });

      tl.current
        .to(
          line1Ref.current,
          {
            y: 8,
            rotate: 45,
            duration: 0.3,
            ease: "power2.out",
          },
          0
        )
        .to(
          line2Ref.current,
          {
            opacity: 0,
            scaleX: 0,
            duration: 0.2,
            ease: "power2.out",
          },
          0
        )
        .to(
          line3Ref.current,
          {
            y: -8,
            rotate: -45,
            duration: 0.3,
            ease: "power2.out",
          },
          0
        )
        .to(
          menuRef.current,
          {
            height: "auto",
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
          },
          0
        );

      const links = menuRef.current.querySelectorAll(".mobile-link");

      if (links?.length) {
        tl.current.fromTo(
          links,
          { x: 40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.07,
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.2"
        );
      }
    },
    {
      scope: headerRef,
      dependencies: [isMobile], // <-- КЛЮЧОВЕ ВИПРАВЛЕННЯ: оновлюємо GSAP після монтування мобільної версії
    }
  );

  // -----------------------------
  // OPEN / CLOSE MENU
  // -----------------------------
  useEffect(() => {
    if (!tl.current) return;

    if (menuOpen) {
      tl.current.play();
    } else {
      tl.current.reverse();
    }
  }, [menuOpen]);

  // -----------------------------
  // CLOSE MENU AFTER NAVIGATION
  // -----------------------------
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      ref={headerRef}
      className={`
        fixed z-[100]
        left-0 right-0
        transition-all duration-300 ease-out

        ${
          scrolled
            ? "top-3 mx-3 rounded-2xl"
            : "top-0"
        }

        bg-black/45
        backdrop-blur-xl
        border border-white/10
        shadow-[0_8px_30px_rgba(0,0,0,0.25)]
      `}
    >
      <div
        className="
          h-[50px] md:h-[60px]
          px-5 sm:px-6 md:px-8 lg:px-10
          flex items-center justify-between
          transition-all duration-300
        "
      >
        {/* LOGO */}
        <Link
          href="/"
          className="
            flex items-center
            shrink-0
            transition-transform duration-300
            hover:scale-[1.03]
          "
        >
          <Identity />
        </Link>

        {/* DESKTOP NAVIGATION */}
        {!isMobile && (
          <nav
            className="
              flex
              ml-auto
              items-center
              gap-2 lg:gap-3
              font-heading
            "
          >
            {navItems.map((item) => {
              const isActive = pathname === "/site" + item.href;

              return (
                <Link
                  key={item.href}
                  href={"/site" + item.href}
                  className={`
                    relative
                    px-4 lg:px-5
                    py-2.5
                    rounded-xl
                    text-sm lg:text-base
                    font-semibold
                    whitespace-nowrap
                    transition-all duration-300

                    ${
                      isActive
                        ? `
                          text-white
                          bg-white/12
                          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]
                        `
                        : `
                          text-white/80
                          hover:text-white
                          hover:bg-white/8
                        `
                    }
                  `}
                >
                  {item.label}

                  <span
                    className={`
                      absolute
                      left-1/2
                      -translate-x-1/2
                      -bottom-[2px]
                      h-[3px]
                      rounded-full
                      bg-[var(--accent)]
                      transition-all duration-300

                      ${
                        isActive
                          ? "w-8 opacity-100"
                          : "w-0 opacity-0"
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>
        )}

        {/* HOUSES */}
        {!isMobile && <Houses />}

        {/* MOBILE BURGER BUTTON */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
            aria-expanded={menuOpen}
            className="
              flex
              ml-auto
              relative
              z-[110]
              w-11 h-11
              rounded-xl
              flex-col
              items-center
              justify-center
              transition-all duration-300
              hover:bg-white/10
              active:scale-95
            "
          >
            <span
              ref={line1Ref}
              className="block w-6 h-[2px] bg-white rounded-full will-change-transform"
            />
            <span
              ref={line2Ref}
              className="block w-6 h-[2px] bg-white rounded-full my-[6px] will-change-transform"
            />
            <span
              ref={line3Ref}
              className="block w-6 h-[2px] bg-white rounded-full will-change-transform"
            />
          </button>
        )}
      </div>

      {/* MOBILE MENU CONTAINER */}
      {isMobile && (
        <div
          ref={menuRef}
          className="
            overflow-hidden
            h-0
            opacity-0
            border-t
            border-white/10
          "
        >
          <nav className="px-5 py-5 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === "/site" + item.href;

              return (
                <Link
                  key={item.href}
                  href={"/site" + item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`
                    mobile-link
                    block
                    px-4
                    py-3.5
                    rounded-xl
                    text-base
                    font-semibold
                    will-change-transform
                    transition-all duration-300

                    ${
                      isActive
                        ? `
                          text-white
                          bg-white/12
                          border border-white/10
                        `
                        : `
                          text-white/80
                          hover:text-white
                          hover:bg-white/8
                        `
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>

                    {isActive && (
                      <span
                        className="
                          w-2
                          h-2
                          rounded-full
                          bg-[var(--accent)]
                          shadow-[0_0_10px_var(--accent)]
                        "
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;