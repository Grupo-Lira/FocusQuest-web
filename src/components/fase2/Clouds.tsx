import Image from "next/image";

export default function Clouds() {
  const clouds = [
    {
    id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem1.svg",
      className: "absolute top-[20%] left-[5%] w-[30%] sm:w-[25%] md:w-[18%] lg:w-[12%]",
    },
    {
      id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem2.svg",
      className:
        "absolute bottom-[23%] left-[14%] w-[28%] sm:w-[24%] md:w-[18%] lg:w-[14%]",
    },
    {
        id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem3.svg",
      className: "absolute bottom-[30%] left-[35%] w-[18%] sm:w-[14%]",
    },
    {
      id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem4.svg",
      className: "absolute bottom-[30%] right-[35%] w-[18%] sm:w-[14%]",
    },
    {
      id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem5.svg",
      className: "absolute bottom-[55%] right-[15%] w-[18%] sm:w-[14%]",
    },
    {
      id: `cloud-${Math.random().toString(36).substring(2, 11)}`,
      src: "/img/nuvens/nuvem6.svg",
      className: "absolute bottom-[25%] right-[15%] w-[16%] sm:w-[12%]",
    },
  ];

  return (
    <>
      {clouds.map((c) => (
        <Image
          key={c.id}
          src={c.src}
          alt="nuvem"
          className={c.className}
          height={144}
          width={280}
        />
      ))}
    </>
  );
}
