import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP - Mapa Coroplético ArcGIS",
  description: "Desafio Mapa Coroplético ArcGIS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
