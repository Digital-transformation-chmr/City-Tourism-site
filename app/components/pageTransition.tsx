"use client";

import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

//   useGSAP(() => {
//     gsap.fromTo(
//         ref.current,
//         {
//             x: 800,
//             opacity: 0,
//         },
//         {
//             x: 0,
//             opacity: 1,
//             duration: .4,
//             ease: "power3.out",
//         }
//     );
//   }, [pathname]);

  return <div ref={ref}>{children}</div>;
}