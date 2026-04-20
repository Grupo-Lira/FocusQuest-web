import { FixedStar } from "@/components/FixedStar";
import { stars } from "@/constants/fase2Stars";

type Props = {
  readonly shiningStar: string | null;
};

export function StarsField({ shiningStar }: Props) {
  return (
    <div className="h-[70%] w-screen ml-32 relative">
      {stars.map((star) => (
        <FixedStar
          key={star.id}
          top={star.top}
          left={star.left}
          isShining={shiningStar === star.id}
        />
      ))}
    </div>
  );
}
