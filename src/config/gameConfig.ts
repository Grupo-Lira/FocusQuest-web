export const animatedElements = [
  {
    id: "nave",
    src: "/img/distracoes/nave.png",
    initial: { x: "0%", y: "0%" },
    animate: { x: "100vw", y: "-100vh" },
    duration: 5,
  },
  {
    id: "meteoro",
    src: "/img/distracoes/meteoro.png",
    initial: { x: "100vw", y: "-100vh" },
    animate: { x: "0vw", y: "-30vh" },
    duration: 3,
  },
  {
    id: "meteoroet",
    src: "/img/distracoes/meteoroet.png",
    initial: { x: "0vw", y: "-150vh" },
    animate: { x: "100vw", y: "-80vh" },
    duration: 2,
  },
  {
    id: "ovni",
    src: "/img/distracoes/ovni.png",
    initial: { x: "0vw", y: "-130vh" },
    animate: { x: "100vw", y: "-130vh" },
    duration: 5,
    repeatType: "reverse" as const,
  },
  {
    id: "et",
    src: "/img/distracoes/et.png",
    initial: { x: "30vw", y: "-130vh" },
    animate: { x: "60vw", y: "-130vh" },
    duration: 2,
    repeatType: "reverse" as const,
  },
];
