import type { Metadata } from "next";
import { Barlow_Condensed, Geist, JetBrains_Mono } from "next/font/google";
import "../css/style.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin | Fútbol en la Piel",
  description: "Panel de administración del catálogo Fútbol en la Piel.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es-UY"
      suppressHydrationWarning
      className={`${barlowCondensed.variable} ${geist.variable} ${jetbrainsMono.variable} overflow-x-clip`}
    >
      <body
        suppressHydrationWarning
        className="overflow-x-clip bg-paper text-ink antialiased"
      >
        {children}
      </body>
    </html>
  );
}
