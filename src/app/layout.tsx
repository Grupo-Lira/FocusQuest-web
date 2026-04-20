import type { Metadata } from "next";
import { Orbitron, Poppins } from "next/font/google";
import Script from "next/script";
import { AudioProvider } from "@/context/AudioContext";
import { EyeTrackingProvider } from "@/context/EyeTrackingContext";
import { GameProvider } from "@/context/GameContext";
import "./globals.css";

type Props = {
  children: React.ReactNode;
};

const ORBITRON_FONT = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["600"],
});

const POPPINS_FONT = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
});

const WEBGAZER_SCRIPT_URL = "https://webgazer.cs.brown.edu/webgazer.js" as const;

export const metadata: Metadata = {
  title: "Focus Quest",
  description:
    "Desafie a sua mente com o Focus Quest, um jogo de perguntas e respostas que testa seus conhecimentos em diversas áreas. Aprenda enquanto se diverte!",
};

export default function RootLayout({ children }: Readonly<Props>) {
  const bodyClassName = `${ORBITRON_FONT.variable} ${POPPINS_FONT.variable} antialiased`;

  return (
    <html lang="pt-br">
      <head>
        <Script src={WEBGAZER_SCRIPT_URL} strategy="beforeInteractive" />
      </head>
      <body className={bodyClassName}>
        <EyeTrackingProvider>
          <GameProvider>
            <AudioProvider>{children}</AudioProvider>
          </GameProvider>
        </EyeTrackingProvider>
      </body>
    </html>
  );
}
