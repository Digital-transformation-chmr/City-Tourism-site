import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AccessibilityMenu from "./accsesability";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "Туристичний сайт",
  description: "Туристичний сайт Черкас",
};
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ua"
      className={cn("h-full", "antialiased", inter.variable, poppins.variable, "font-mono", jetbrainsMono.variable)}
    >
      <body className=" flex flex-col">
          {children}
          <AccessibilityMenu/>
      </body>

    </html>
  );
}
