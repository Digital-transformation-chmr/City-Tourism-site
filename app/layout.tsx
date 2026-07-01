import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import AccessibilityMenu from "./accsesability";

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
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className=" flex flex-col">
        {children}
        <AccessibilityMenu/>
      </body>

    </html>
  );
}
