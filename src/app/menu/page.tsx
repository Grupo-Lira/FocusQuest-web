import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";

type Level = {
  id: number;
  image: string;
  position: { top: string; left: string };
  positionNumber: { top: string; left: string };
  disabled: boolean;
  href: string;
};

const LEVELS: ReadonlyArray<Level> = [
  {
    id: 1,
    image: "/img/planeta1.svg",
    position: { top: "28%", left: "10%" },
    positionNumber: { top: "70%", left: "15%" },
    disabled: false,
    href: "/fase/1",
  },
  {
    id: 2,
    image: "/img/planeta2.svg",
    position: { top: "60%", left: "40%" },
    positionNumber: { top: "40%", left: "47%" },
    disabled: true,
    href: "/fase/2",
  },
  {
    id: 3,
    image: "/img/planeta3.svg",
    position: { top: "20%", left: "75%" },
    positionNumber: { top: "65%", left: "83%" },
    disabled: true,
    href: "/fase/3",
  },
] as const;

const getBorderClass = (disabled: boolean) => {
  if (disabled === true) return "border-[#414141]";
  return "border-[var(--primary)] button-glow transition-all duration-300";
};

const getBadgeBackgroundClass = (disabled: boolean) => {
  if (disabled === true) return "bg-[#414141]";
  return "bg-[var(--primary)]";
};

const getLightIcon = (disabled: boolean) => {
  if (disabled === true) return "/img/luz-disabled.svg";
  return "/img/luz.svg";
};

// Gives each planet a slightly different duration and delay
// so the floating movement doesn't look synchronized.
const getFloatStyle = (id: number): React.CSSProperties => {
  const duration = `${6 + id * 1.2}s`;
  const delay = `${id * 0.4}s`;
  const style = { "--float-duration": duration, animationDelay: delay };
  return style as React.CSSProperties;
};

type Props = {
  level: Level;
};

const LevelMarker = ({ level }: Props) => {
  const borderClass = getBorderClass(false);
  const badgeBgClass = getBadgeBackgroundClass(false);
  const lightIcon = getLightIcon(false);
  const floatStyle = getFloatStyle(level.id);
  const alt = `Planeta ${level.id}`;

  return (
    <Link href={level.href}>
      <Image
        src={level.image}
        width={300}
        height={300}
        alt={alt}
        className="planet-float absolute transition-transform duration-300 [animation:float_var(--float-duration)_ease-in-out_infinite]"
        style={{ ...level.position, ...floatStyle }}
      />
      <div
        className={`absolute w-24 h-24 border-4 ${borderClass} rounded-full flex items-center justify-center`}
        style={level.positionNumber}
      >
        <Image
          src={lightIcon}
          alt={alt}
          className="absolute top-3.5 right-3.5"
          width={39}
          height={38}
        />
        <p
          className={`text-[var(--white)] text-5xl ${badgeBgClass} w-[5.188rem] h-[5.188rem] rounded-full flex items-center justify-center font-semibold`}
        >
          {level.id}
        </p>
      </div>
    </Link>
  );
};

export default function MenuPage() {
  const markers = LEVELS.map((level) => <LevelMarker key={level.id} level={level} />);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div className="flex justify-center mt-6">
        <Navbar />
      </div>
      {markers}
    </div>
  );
}