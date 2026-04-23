"use client";

import { Bolt, Home, ScanEyeIcon, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";

type NavLinkItem = {
  id: number;
  href: string;
  label: string;
  icon: React.ReactNode;
};

const LINKS: ReadonlyArray<NavLinkItem> = [
  { id: 1, href: "/menu", label: "Menu", icon: <Home /> },
  { id: 2, href: "/fichas", label: "Fichas", icon: <Users /> },
  { id: 4, href: "/calibration", label: "Calibração", icon: <ScanEyeIcon /> },
  { id: 3, href: "/settings", label: "Configurações", icon: <Bolt /> },
];

const BASE_LINK_CLASS =
  "flex items-center gap-1.5 px-4 py-2 rounded-full transition duration-300 font-semibold";

const getLinkClass = (isActive: boolean) => {
  if (isActive === true) {
    return `${BASE_LINK_CLASS} bg-[var(--primary)] text-[var(--white)] button-3d`;
  }
  return `${BASE_LINK_CLASS} hover:bg-gray-100 bg-[var(--white)] text-[var(--primary)] inner-shadow`;
};

const NavLink = ({ link, isActive }: { link: NavLinkItem; isActive: boolean }) => {
  const linkClass = getLinkClass(isActive);

  return (
    <Link href={link.href} className={linkClass}>
      {link.icon}
      <p>{link.label}</p>
    </Link>
  );
};

const Avatar = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      className="w-11.5 h-11.5 border-2 rounded-full border-[var(--primary)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
      onClick={onClick}
    >
      <Image
        src="/img/avatar.png"
        alt="Avatar"
        width={36}
        height={35}
        className="rounded-full"
      />
    </div>
  );
};

export function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-[var(--white)] px-6 py-3 flex w-fit rounded-full gap-40">
        <div className="flex gap-5">
          {LINKS.map((link) => (
            <NavLink key={link.id} link={link} isActive={pathname === link.href} />
          ))}
        </div>
        <Avatar onClick={() => setIsModalOpen(true)} />
      </div>
      <ProfileEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
