import Image from "next/image";
import { useState } from "react";
import { useAudio } from "@/context/AudioContext";
import { Button } from "./Button";
import { Card } from "./Card";

type Props = {
  readonly isInitialGame?: boolean;
  readonly isStoppedGame?: boolean;
  readonly onClick?: () => void;
};

type VolumeSliderProps = {
  readonly iconSrc: string;
  readonly iconAlt: string;
  readonly value: number;
  readonly onChange: (value: number) => void;
};

const SLIDER_CLASS =
  "w-56 h-2 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]" as const;
const DEFAULT_VOLUME_VALUE = 50;

const getSliderBackground = (value: number) => {
  return {
    background: `linear-gradient(to right, var(--primary) ${value}%, #ccc ${value}%)`,
  };
};

const redirectToMenu = () => {
  globalThis.location.href = "/menu";
};

const VolumeSlider = ({ iconSrc, iconAlt, value, onChange }: VolumeSliderProps) => {
  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };
  const backgroundStyle = getSliderBackground(value);

  return (
    <div className="flex items-center gap-4">
      <Image src={iconSrc} height={40} width={40} alt={iconAlt} />
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={onInputChange}
        style={backgroundStyle}
        className={SLIDER_CLASS}
      />
    </div>
  );
};

const ModalButtons = ({
  isInitialGame,
  isStoppedGame,
  onClick,
}: Pick<Props, "isInitialGame" | "isStoppedGame" | "onClick">) => {
  if (isInitialGame === true) {
    return <Button text="Voltar" onClick={onClick} />;
  }
  if (isStoppedGame === true) {
    return (
      <div className="flex gap-4">
        <Button text="Voltar ao jogo" onClick={onClick} className="px-1.5 py-2.5" />
        <Button text="Sair" onClick={redirectToMenu} />
      </div>
    );
  }
  return null;
};

export function SettingsModal({
  isInitialGame = false,
  isStoppedGame = false,
  onClick,
}: Props) {
  const { volume, setVolume } = useAudio();
  const [volumeValue, setVolumeValue] = useState(DEFAULT_VOLUME_VALUE);

  const buttons = (
    <ModalButtons
      isInitialGame={isInitialGame}
      isStoppedGame={isStoppedGame}
      onClick={onClick}
    />
  );

  return (
    <Card title="Configurações" buttons={buttons}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <VolumeSlider
              iconSrc="/img/music.svg"
              iconAlt="Icone de música"
              value={volume}
              onChange={setVolume}
            />
          </div>
          <VolumeSlider
            iconSrc="/img/volume.svg"
            iconAlt="Icone de volume"
            value={volumeValue}
            onChange={setVolumeValue}
          />
        </div>
      </div>
    </Card>
  );
}
