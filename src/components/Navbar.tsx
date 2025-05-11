"use client";

import { Award, Bolt, HelpCircle, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const links = [
  { id: 1, href: "/menu", label: "Menu", icon: <Home /> },
  { id: 2, href: "/ranking", label: "Ranking", icon: <Award /> },
  { id: 3, href: "/settings", label: "Configurações", icon: <Bolt /> },
  { id: 4, href: "/help", label: "Ajuda", icon: <HelpCircle /> },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40">
      <div className="flex gap-5">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.id}
              href={link.href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition duration-300 font-semibold
                            ${
                              isActive
                                ? "bg-[var(--primary)] text-[var(--white)] button-3d"
                                : "hover:bg-gray-100 bg-[var(--white)] text-[var(--primary)] inner-shadow"
                            }`}
            >
              {link.icon}
              <p>{link.label}</p>
            </Link>
          );
        })}
      </div>
      <div className="w-11.5 h-11.5 border-2 rounded-full border-[var(--primary)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105">
        <Image
          src="/img/avatar.png"
          alt="Avatar"
          width={36}
          height={35}
          className="rounded-full"
        />
      </div>
    </div>
  );
}
