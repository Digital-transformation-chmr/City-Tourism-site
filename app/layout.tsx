import type { Metadata } from "next";
import {
  Inter,
  Poppins,
  JetBrains_Mono,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import AccessibilityMenu from "./accsesability";
import { cn } from "@/lib/utils";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Туристичний сайт",
  description: "Туристичний сайт Черкас",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ua"
      className={cn(
        "h-full",
        "antialiased",
        montserrat.variable

      )}
    >
      <body className="flex flex-col font-sans">
        {children}
        <AccessibilityMenu />
      </body>
    </html>
  );
}