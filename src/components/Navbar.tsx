"use client";

import { Bolt, Home, Languages, ScanEyeIcon, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ProfileEditModal } from "./ProfileEditModal";
import { TrainingModeToggle } from "./TrainingModeToggle";
import { useLanguage, useT } from "@/i18n/client";

type NavLinkItem = {
  id: number;
  href: string;
  label: string;
  icon: React.ReactNode;
};

// Reduzimos o tamanho dos ícones passando a prop size={18}
const LINKS: ReadonlyArray<NavLinkItem> = [
  { id: 1, href: "/menu", label: "Menu", icon: <Home size={18} /> },
  { id: 2, href: "/fichas", label: "Fichas", icon: <Users size={18} /> },
  { id: 4, href: "/calibration", label: "Calibração", icon: <ScanEyeIcon size={18} /> },
  { id: 3, href: "/settings", label: "Configurações", icon: <Bolt size={18} /> },
];

// Reduzimos o padding (px-3 py-1.5) e adicionamos text-sm para ficar mais compacto
const BASE_LINK_CLASS =
  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition duration-300 font-semibold";

const getLinkClass = (isActive: boolean) => {
  if (isActive === true) {
    return `${BASE_LINK_CLASS} bg-[var(--primary)] text-[var(--white)] button-3d`;
  }
  return `${BASE_LINK_CLASS} hover:bg-gray-100 bg-[var(--white)] text-[var(--primary)] inner-shadow`;
};

const NavLink = ({ link, isActive }: { link: NavLinkItem; isActive: boolean }) => {
  const linkClass = getLinkClass(isActive);
  const t = useT();

  return (
    <Link href={link.href} className={linkClass}>
      {link.icon}
      <p>{t(link.label)}</p>
    </Link>
  );
};

const Avatar = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      // Reduzimos o wrapper do avatar de 11.5 (46px) para 9 (36px)
      className="w-9 h-9 border-2 rounded-full border-[var(--primary)] flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 overflow-hidden"
      onClick={onClick}
    >
      <Image
        src="/img/avatar.png"
        alt="Avatar"
        width={32}
        height={32}
        className="rounded-full object-cover"
      />
    </div>
  );
};

export function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <>
      {/* Reduzimos o padding do container (px-4 py-2) 
        e trocamos o gap-40 (que era enorme) por um gap-12
      */}
      <div className="bg-[var(--white)] px-4 py-2 flex flex-wrap items-center justify-center w-fit max-w-[calc(100vw-1rem)] rounded-full gap-2 sm:gap-6 shadow-sm border border-gray-100">
        {/* Reduzimos o gap entre os links de 5 para 2 */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LINKS.slice(0, 3).map((link) => (
            <NavLink key={link.id} link={link} isActive={pathname === link.href} />
          ))}
          <TrainingModeToggle />
          {LINKS.slice(3).map((link) => (
            <NavLink key={link.id} link={link} isActive={pathname === link.href} />
          ))}
          <div className="flex items-center gap-1.5 rounded-full bg-[var(--white)] px-2 py-1 text-sm font-semibold text-[var(--primary)] inner-shadow">
            <Languages size={18} aria-hidden="true" />
            <label htmlFor="site-language" className="sr-only">{t("Idioma")}</label>
            <select
              id="site-language"
              aria-label={t("Idioma")}
              value={language}
              onChange={(event) => setLanguage(event.target.value as "pt-BR" | "en")}
              className="cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            >
              <option value="pt-BR">Português</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <Avatar onClick={() => setIsModalOpen(true)} />
      </div>
      <ProfileEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
