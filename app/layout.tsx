import type { Metadata } from "next";

import {
  Inter,
  Poppins,
  JetBrains_Mono,
  Playfair_Display,
  Montserrat,
} from "next/font/google";

import "./globals.css";

import AccessibilityMenu from "./accsesability";
import AdminBar from "./admin/components/AdminBar";
import { cn } from "@/lib/utils";

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
      lang="uk"
      className={cn(
        "h-full",
        "antialiased",
        montserrat.variable
      )}
    >
      <body className="flex min-h-full flex-col font-sans">

        {children}
        <AdminBar />

        <AccessibilityMenu />
      </body>
    </html>
  );
}