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
        {/* <nav className="hidden md:flex gap-6 font-bold font-heading items-center">
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
        </nav> */}

        {/* Burger Button */}
        <button
          className=" flex flex-col justify-center items-center h-10 w-10 p-2 relative z-50 focus:outline-none"
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
        className="overflow-hidden h-0 opacity-0 border-white/10"
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