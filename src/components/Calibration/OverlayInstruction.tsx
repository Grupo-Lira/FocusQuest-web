import { PlayIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { StepProps } from "@/constants/steps";
import { Button } from "../Button";

type Props = {
  readonly onComplete: () => void;
  readonly steps: ReadonlyArray<StepProps>;
};

const getPrevIndex = (currentIndex: number, total: number) => {
  const prevIndex = (currentIndex - 1 + total) % total;
  return prevIndex;
};

const getNextIndex = (currentIndex: number, total: number) => {
  const nextIndex = (currentIndex + 1) % total;
  return nextIndex;
};

const getPrevButtonClass = (currentIndex: number) => {
  if (currentIndex === 0) return "hidden";
  return "";
};

export function OverlayInstruction({ onComplete, steps }: Props) {
  const [currentStep, setCurrentStep] = useState(steps[0]);

  if (currentStep === undefined) return null;

  const currentIndex = steps.findIndex((step) => step.id === currentStep.id);
  const prevButtonClass = getPrevButtonClass(currentIndex);

  const onPrev = () => {
    const prevIndex = getPrevIndex(currentIndex, steps.length);
    setCurrentStep(steps[prevIndex]);
  };

  const onNext = () => {
    const nextIndex = getNextIndex(currentIndex, steps.length);
    setCurrentStep(steps[nextIndex]);
  };

  return (
    <div className="absolute w-full min-h-screen inset-0 flex items-center justify-center bg-[#00000055] bg-opacity-50 z-12">
      <div className="bg-[var(--white)] p-16 rounded-4xl shadow w-[85%] flex justify-center text-[var(--primary)] flex-col gap-10 mb-[12%] h-[300px]">
        <div className="flex items-center gap-10 flex-col max-w-[70%]">
          <p className="text-4xl font-semibold font-orbitron uppercase">
            {currentStep.description}
          </p>
          <div className="flex">
            <button type="button" onClick={onPrev} className={prevButtonClass}>
              <PlayIcon className="scale-x-[-1]" size={50} />
            </button>
            {currentStep.isFinal === true ? (
              <div className="flex">
                <Button onClick={onComplete} text="Começar" />
              </div>
            ) : (
              <button type="button" onClick={onNext}>
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
