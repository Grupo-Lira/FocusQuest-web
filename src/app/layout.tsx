import type { Metadata } from "next";
import { Orbitron, Poppins } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/context/GameContext";
import Script from "next/script";
import { EyeTrackingProvider } from "@/context/EyeTrackingContext";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
});
export const metadata: Metadata = {
  title: "Focus Quest",
  description: "Desafie a sua mente com o Focus Quest, um jogo de perguntas e respostas que testa seus conhecimentos em diversas áreas. Aprenda enquanto se diverte!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <Script
          src="https://webgazer.cs.brown.edu/webgazer.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${orbitron.variable} ${poppins.variable} antialiased`}>
        <EyeTrackingProvider>
          <GameProvider>{children}</GameProvider>
        </EyeTrackingProvider>
      </body>
    </html>
  );
}
