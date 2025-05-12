import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

interface SettingPageProps {
  isInitialGame?: boolean;
  isStoppedGame?: boolean;
  onClick?: () => void;
}

export default function SettingsModal({
  isInitialGame = false,
  isStoppedGame = false,
  onClick,
}: SettingPageProps) {
  const [musicValue, setMusicValue] = useState(50);
  const [volumeValue, setVolumeValue] = useState(50);

  return (
    <Card
      title="Configurações"
      buttons={
        <>
          {isInitialGame && <Button text="Voltar" onClick={onClick} />}
          {isStoppedGame && (
            <div className="flex gap-4">
              <Button text="Voltar ao jogo" onClick={onClick} className="px-1.5 py-2.5" />
              <Button text="Sair" onClick={() => (window.location.href = "/menu")} />
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-4 mb-4">
            <Image src="/img/music.svg" height={40} width={40} alt="Icone de música" />
            <input
              type="range"
              min="0"
              max="100"
              value={musicValue}
              onChange={(e) => setMusicValue(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${musicValue}%, #ccc ${musicValue}%)`,
              }}
              className="w-56 h-2 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-4">
            <Image src="/img/volume.svg" height={40} width={40} alt="Icone de volume" />
            <input
              type="range"
              min="0"
              max="100"
              value={volumeValue}
              onChange={(e) => setVolumeValue(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--primary) ${volumeValue}%, #ccc ${volumeValue}%)`,
              }}
              className="w-56 h-2 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
