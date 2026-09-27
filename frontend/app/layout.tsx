import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alimentos Enriko — Control de Facturas & Cotizaciones",
  description: "Gestión documental corporativa con Next.js 16, React 19, FastAPI y MySQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
