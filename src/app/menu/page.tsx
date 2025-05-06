import Navbar from "@/components/Navbar";
import Image from "next/image";
const levels = [
  {
    id: 1,
    image: "/img/planeta1.svg",
    position: { top: "28%", left: "10%" },
    positionNumber: { top: "70%", left: "15%" },
    disabled: false,
  },
  {
    id: 2,
    image: "/img/planeta2.svg",
    position: { top: "60%", left: "40%" },
    positionNumber: { top: "40%", left: "47%" },
    disabled: true,
  },
  {
    id: 3,
    image: "/img/planeta3.svg",
    position: { top: "20%", left: "75%" },
    positionNumber: { top: "65%", left: "83%" },
    disabled: true,
  },
];

export default function MenuPage() {
  return (
    <div className="relative w-full h-screen overflow-hidden ">
      <div className="flex justify-center mt-6">
        <Navbar />
      </div>
      {levels.map((level) => (
        <div key={level.id}>
          <Image
            src={level.image}
            width={400}
            height={400}
            alt={`Planeta ${level.id}`}
            className="absolute transition-transform duration-300"
            style={level.position}
          />
          <div
            className={`absolute w-28 h-28 border-4 ${
              level.disabled
                ? "border-[#414141]"
                : "border-[var(--primary)] button-glow transition-all duration-300"
            }  rounded-full flex items-center justify-center`}
            style={level.positionNumber}
          >
            <Image
              src={level.disabled ? "/img/luz-disabled.svg" : "/img/luz.svg"}
              alt={`Planeta ${level.id}`}
              className="absolute top-3.5 right-3.5"
              width={43}
              height={42}
            />
            <p
              className={`text-[var(--white)] text-5xl ${
                level.disabled ? "bg-[#414141]" : "bg-[var(--primary)]"
              } w-[5.4375rem] h-[5.4375rem] rounded-full flex items-center justify-center font-semibold`}
            >
              {level.id}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
