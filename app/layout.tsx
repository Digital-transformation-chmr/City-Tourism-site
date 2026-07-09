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

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
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
        inter.variable,
        poppins.variable,
        jetbrainsMono.variable,
        playfair.variable
      )}
    >
      <body className="flex flex-col font-display">
        {children}
        <AccessibilityMenu />
      </body>
    </html>
  );
}