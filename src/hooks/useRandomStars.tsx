export function useRandomStars(count: number, minDistance = 10) {
  const generate = () => {
    const newStars: { top: number; left: number; id: number }[] = [];

    const isFarEnough = (
      top: number,
      left: number,
      starsList: { top: number; left: number }[]
    ) => {
      return starsList.every((star) => {
        const dx = star.left - left;
        const dy = star.top - top;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance >= minDistance;
      });
    };

    while (newStars.length < count) {
      const top = Math.random() * 90;
      const left = Math.random() * 90;

      if (isFarEnough(top, left, newStars)) {
        newStars.push({ top, left, id: newStars.length });
      }
    }

    return newStars;
  };

  return { generate };
}
