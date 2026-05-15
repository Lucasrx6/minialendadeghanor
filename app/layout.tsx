import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forja de Ghanor",
  description: "Criador de personagens para A Lenda de Ghanor RPG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#f3e2bd] text-stone-950">{children}</body>
    </html>
  );
}
