import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Поликлиника | Система управления медицинским центром",
  description: "Современная платформа для записи к врачам и управления медицинскими картами.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <Navbar />
        <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}

