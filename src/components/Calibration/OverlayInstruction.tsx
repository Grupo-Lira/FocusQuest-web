import { PlayIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { StepProps } from "@/constants/steps";
import { Button } from "../Button";

interface OverlayInstructionProps {
  readonly onComplete: () => void;
  readonly steps: ReadonlyArray<StepProps>;
}

export function OverlayInstruction({ onComplete, steps }: OverlayInstructionProps) {
  const [currentStep, setCurrentStep] = useState(steps[0]);

  if (!currentStep) return null;

  const currentIndex = steps.findIndex((step) => step.id === currentStep.id);

  return (
    <div className="absolute w-full min-h-screen inset-0 flex items-center justify-center bg-[#00000055] bg-opacity-50 z-12">
      <div className="bg-[var(--white)] p-16 rounded-4xl shadow w-[85%] flex justify-center text-[var(--primary)] flex-col gap-10 mb-[12%] h-[300px]">
        <div className="flex items-center gap-10 flex-col max-w-[70%]">
          <p className="text-4xl font-semibold font-orbitron uppercase">
            {currentStep.description}
          </p>
          <div className="flex">
            <button
              onClick={() => {
                const prevIndex = (currentIndex - 1 + steps.length) % steps.length;
                setCurrentStep(steps[prevIndex]);
              }}
              className={currentIndex === 0 ? "hidden" : ""}
            >
              <PlayIcon className="scale-x-[-1]" size={50} />
            </button>
            {currentStep.isFinal ? (
              <div className="flex">
                <Button onClick={onComplete} text="Começar" />
              </div>
            ) : (
              <button
                onClick={() => {
                  const nextIndex = (currentIndex + 1) % steps.length;
                  setCurrentStep(steps[nextIndex]);
                }}
              >
                <PlayIcon size={50} />
              </button>
            )}
          </div>
        </div>
      </div>
      <Image
        src="/img/astronauta.svg"
        alt="Astronauta"
        width={400}
        height={700}
        className="absolute bottom-0 right-30 w-40 sm:w-60 md:w-80 lg:w-[500px] xl:w-[350px] h-auto"
      />
    </div>
  );
}
