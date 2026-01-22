"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

interface HeaderProps {
  lang: string;
}

export const Header: React.FC<HeaderProps> = ({ lang }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const toggleLangMenu = () => {
    setShowLangMenu((prev) => !prev);
  };
  const pathname = usePathname();

  const getLangHref = (targetLang: string) => {
    const segments = pathname.split("/");
    if (segments.length === 0 || segments[0] !== "") return pathname;
    const currentFirst = segments[1];
    if (currentFirst === "ru" || currentFirst === "ua") {
      segments.splice(1, 1);
    }
    const newPath =
      targetLang === "ru"
        ? ["", "ru", ...segments.slice(1)].join("/")
        : ["", ...segments.slice(1)].join("/");
    return newPath === "" ? "/" : newPath;
  };

  return (
    <header className="bg-white w-full h-[50px] flex items-center justify-between px-[10px] sm:px-[120px]">
      <div className="flex items-center gap-[30px]">
        <Link href={lang === "ru" ? "/ru" : "/"}>
          <Image
            src="/logo.svg"
            alt="Company logo"
            width={132}
            height={30}
            className="h-[30px] w-[132px]"
          />
        </Link>

        <Link href={lang === "ru" ? "/ru/mfo" : "/mfo"}>
          <p className="font-bold text-[13px] leading-[16px] text-[#222222]">
            Рейтинг МФО
          </p>
        </Link>
      </div>

      <div className="relative">
        <button onClick={toggleLangMenu}>
          <Image
            src="/Frame 108.svg"
            alt="language toggle"
            width={24}
            height={24}
          />
        </button>

        {showLangMenu && (
          <div className="absolute -bottom-20 right-4 w-fit p-[10px] rounded-[6px] border-b border-gray-200 bg-white shadow-md flex flex-col gap-[11px] z-50">
            <Link
              href={getLangHref("ua")}
              className={`text-[16px] leading-[24px] font-bold ${
                lang === "ua" ? "text-[#724DEA]" : "text-[#9393A3]"
              }`}
            >
              Українська
            </Link>

            <Link
              href={getLangHref("ru")}
              className={`text-[16px] leading-[24px] font-bold ${
                lang === "ru" ? "text-[#724DEA]" : "text-[#9393A3]"
              }`}
            >
              Русский
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
