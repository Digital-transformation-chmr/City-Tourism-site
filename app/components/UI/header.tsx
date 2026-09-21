"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { Identity } from "./identity";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const navItems = [
  { href: "/Attractions", label: "Куди піти?" },
  { href: "/WhereToEat", label: "Де поїсти?" },
  { href: "/Hotels", label: "Де зупинитись?" },
  { href: "/InteractiveMap", label: "Інтерактивна карта" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);

  const tl = useRef<gsap.core.Timeline | null>(null);

  // -----------------------------
  // SCROLL
  // -----------------------------

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      tl.current = gsap.timeline({
        paused: true,
      });

      tl.current
        // burger line 1
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

        // burger line 2
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

        // burger line 3
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

        // mobile menu
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

      const links =
        menuRef.current?.querySelectorAll(".mobile-link");

      if (links?.length) {
        tl.current.fromTo(
          links,
          {
            x: 40,
            opacity: 0,
          },
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
      {/* ================================= */}
      {/* MAIN HEADER */}
      {/* ================================= */}

      <div
        className={`
          h-[50px] md:h-[60px]
          px-5 sm:px-6 md:px-8 lg:px-10
          flex items-center
          transition-all duration-300
        `}
      >
        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <Link
          href="/"
          className="
            flex items-center
            shrink-0
            transition-transform duration-300
            hover:scale-[1.03]
          "
        >
          <Logo />
          <Identity/>
        </Link>

        {/* ================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================= */}

        <nav
          className="
            hidden lg:flex
            ml-auto
            items-center
            gap-2 lg:gap-3
            font-heading
          "
        >
          {navItems.map((item) => {
            const isActive =
              pathname === "/site" + item.href;

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

                {/* ACTIVE INDICATOR */}

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

        {/* ================================= */}
        {/* MOBILE BURGER */}
        {/* ================================= */}

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={
            menuOpen
              ? "Закрити меню"
              : "Відкрити меню"
          }
          aria-expanded={menuOpen}
          className="
            lg:hidden
            ml-auto
            relative
            z-[110]
            w-11 h-11
            rounded-xl
            flex flex-col
            items-center
            justify-center
            transition-all duration-300
            hover:bg-white/10
            active:scale-95
          "
        >
          <span
            ref={line1Ref}
            className="
              block
              w-6 h-[2px]
              bg-white
              rounded-full
              will-change-transform
          "
          />

          <span
            ref={line2Ref}
            className="
              block
              w-6 h-[2px]
              bg-white
              rounded-full
              my-[6px]
              will-change-transform
          "
          />

          <span
            ref={line3Ref}
            className="
              block
              w-6 h-[2px]
              bg-white
              rounded-full
              will-change-transform
          "
          />
        </button>
      </div>

      {/* ================================= */}
      {/* MOBILE MENU */}
      {/* ================================= */}

      <div
        ref={menuRef}
        className="
          lg:hidden
          overflow-hidden
          h-0
          opacity-0
          border-t
          border-white/10
        "
      >
        <nav
          className="
            px-5
            py-5
            flex flex-col
            gap-2
          "
        >
          {navItems.map((item) => {
            const isActive =
              pathname === "/site" + item.href;

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
    </header>
  );
};

export default Header;


// 'use client';

// import Link from "next/link";
// import { Logo } from "./logo";
// import { useEffect, useRef, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import gsap from "gsap";
// import { Compass, UtensilsCrossed, BedDouble, Map } from "lucide-react";

// const navItems = [
//   { href: "/Attractions", label: "Куди піти?", icon: Compass },
//   { href: "/WhereToEat", label: "Де поїсти?", icon: UtensilsCrossed },
//   { href: "/Hotels", label: "Де зупинитись?", icon: BedDouble },
//   { href: "/InteractiveMap", label: "Інтерактивна карта", icon: Map },
// ];

// // наскільки довша активна закладка за інші (px) — саме довжина, не зсув,
// // щоб вона лишалась приклеєною зверху, а не "висіла" окремо
// const ACTIVE_EXTRA = 14;
// // наскільки закладка "пірнає" вниз при кліку (px)
// const DIP_EXTRA = 26;
// // глибина трикутного вирізу знизу закладки (px)
// const NOTCH = 14;
// // наскільки закладка фізично продовжується за межі екрана вгору —
// // завдяки цьому вона виглядає як безперервна стрічка, а не як
// // прямокутник, що просто з'являється з нічого
// const OFFSCREEN = 80;

// const Header = () => {
//   const pathname = usePathname();
//   const router = useRouter();

//   const [scrolled, setScrolled] = useState(false);

//   const headerRef = useRef<HTMLElement>(null);
//   const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
//   const isAnimating = useRef(false);

//   // тема з localStorage (як і раніше)
//   useEffect(() => {
//     const savedTheme = localStorage.getItem("theme");
//     const isDark = savedTheme === "dark";
//     document.documentElement.classList.toggle("dark", isDark);
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => setScrolled(window.scrollY > 20);
//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // прокидаємо реальну висоту хедера в CSS-змінну,
//   // щоб контент сторінки міг відступити рівно стільки, скільки треба
//   useEffect(() => {
//     document.documentElement.style.setProperty(
//       "--header-h",
//       scrolled ? "72px" : "92px"
//     );
//   }, [scrolled]);

//   // при кожній зміні сторінки — усі закладки "випадають" згори
//   useEffect(() => {
//     const tabs = tabRefs.current.filter(Boolean) as HTMLAnchorElement[];
//     if (!tabs.length) return;

//     gsap.killTweensOf(tabs);
//     gsap.fromTo(
//       tabs,
//       { y: -60 },
//       {
//         y: 0,
//         duration: 0.7,
//         ease: "back.out(1.7)",
//         stagger: 0.09,
//       }
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   const handleTabClick = (
//     e: React.MouseEvent<HTMLAnchorElement>,
//     href: string
//   ) => {
//     e.preventDefault();
//     const isActive = pathname === "/site" + href;
//     if (isActive || isAnimating.current) return;

//     const target = e.currentTarget;
//     isAnimating.current = true;

//     const tl = gsap.timeline({
//       onComplete: () => {
//         isAnimating.current = false;
//         router.push("/site" + href);
//       },
//     });

//     // закладка опускається...
//     tl.to(target, {
//       y: DIP_EXTRA,
//       scaleY: 1.05,
//       duration: 0.22,
//       ease: "power2.in",
//     })
//       // ...і пружно піднімається назад
//       .to(target, {
//         y: 0,
//         scaleY: 1,
//         duration: 0.4,
//         ease: "elastic.out(1, 0.55)",
//       });
//   };

//   return (
//     <header
//       ref={headerRef}
//       className={`fixed z-50 top-0 left-0 right-0 transition-all duration-300 ease-in-out bg-[#462606] ${
//         scrolled ? "h-[72px]" : "h-[92px]"
//       }`}
//     >
//       {/* ---- розгорнута книжка ---- */}
//       <div className="absolute inset-0 flex overflow-hidden shadow-lg">
//         {/* ліва сторінка */}
//         <div
//           className="relative flex-1 h-full"
//           style={{
//             background:
//               "linear-gradient(180deg, #f4ecd8 0%, #ece0c4 75%, #ddcda0 100%)",
//             transform: "skewY(-0.6deg)",
//             transformOrigin: "top left",
//             boxShadow: "inset -20px 0 26px -22px rgba(60,40,10,0.4)",
//           }}
//         >
//           <div className="h-full flex items-center pl-6 md:pl-10">
//             <Link href="/">
//               <Logo />
//             </Link>
//           </div>
//           <div
//             className="absolute left-0 right-0 bottom-0 h-2 opacity-60 pointer-events-none"
//             style={{
//               background:
//                 "repeating-linear-gradient(180deg, rgba(120,90,40,0.28) 0px, rgba(120,90,40,0.28) 1px, transparent 1px, transparent 3px)",
//             }}
//           />
//         </div>

//         {/* корінець книги */}
//         <div
//           className="relative w-3 md:w-5 h-full"
//           style={{
//             background:
//               "linear-gradient(90deg, rgba(60,40,10,0.05), rgba(60,40,10,0.45), rgba(60,40,10,0.05))",
//           }}
//         />

//         {/* права сторінка */}
//         <div
//           className="relative flex-1 h-full"
//           style={{
//             background:
//               "linear-gradient(180deg, #f4ecd8 0%, #ece0c4 75%, #ddcda0 100%)",
//             transform: "skewY(0.6deg)",
//             transformOrigin: "top right",
//             boxShadow: "inset 20px 0 26px -22px rgba(60,40,10,0.4)",
//           }}
//         >
//           <div
//             className="absolute left-0 right-0 bottom-0 h-2 opacity-60 pointer-events-none"
//             style={{
//               background:
//                 "repeating-linear-gradient(180deg, rgba(120,90,40,0.28) 0px, rgba(120,90,40,0.28) 1px, transparent 1px, transparent 3px)",
//             }}
//           />
//         </div>
//       </div>

//       {/* ---- закладки-навігація ---- */}
//       <nav className="absolute right-3 md:right-10 top-0 flex gap-1.5 md:gap-3 h-full items-start z-10">
//         {navItems.map((item, i) => {
//           const isActive = pathname === "/site" + item.href;
//           return (
//             <Link
//               key={item.href}
//               href={"/site" + item.href}
//               data-href={item.href}
//               ref={(el) => {
//                 tabRefs.current[i] = el;
//               }}
//               onClick={(e) => handleTabClick(e, item.href)}
//               aria-current={isActive ? "page" : undefined}
//               title={item.label}
//               aria-label={item.label}
//               style={{
//                 clipPath: `polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - ${NOTCH}px), 0 100%)`,
//                 background: isActive
//                   ? "linear-gradient(180deg, #c14747, #7a2323)"
//                   : "linear-gradient(180deg, #8a8f78, #5f6450)",
//                 boxShadow: "0 5px 10px rgba(0,0,0,0.3)",
//                 // фізичне продовження за межі екрана: піднімаємо стрічку
//                 // від'ємним marginTop і одразу компенсуємо той самий
//                 // відступ ізсередини (paddingTop), тому іконка лишається
//                 // на тому самому візуальному місці
//                 marginTop: -OFFSCREEN,
//                 paddingTop: OFFSCREEN + 12,
//                 paddingBottom: isActive ? 28 + ACTIVE_EXTRA : 28,
//                 willChange: "transform",
//               }}
//               className="relative w-8 md:w-10 flex justify-center items-start hover:brightness-110 transition-[filter]"
//             >
//               <item.icon
//                 className="text-[#f4ecd8]"
//                 size={18}
//                 strokeWidth={2.2}
//                 aria-hidden="true"
//               />
//             </Link>
//           );
//         })}
//       </nav>
//     </header>
//   );
// };

// export default Header;