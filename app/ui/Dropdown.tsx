"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type DropdownOption = { label: string; value: string };

type DropdownProps = {
  options?: DropdownOption[];
  endpoint?: string;
  mfoSlug?: string; // slug вместо ID
  lang?: "ua" | "ru";
  onChange?: (value: string) => void;
};

const Dropdown: React.FC<DropdownProps> = ({
  options,
  endpoint,
  mfoSlug,
  onChange,
  lang = "ru",
}) => {
  const defaultOptions: DropdownOption[] =
    lang === "ua"
      ? [
          { label: "Спочатку нові", value: "newest" },
          { label: "Спочатку старі", value: "oldest" },
          { label: "За популярністю", value: "popular" },
          { label: "За рейтингом", value: "rating" },
        ]
      : [
          { label: "Сначала новые", value: "newest" },
          { label: "Сначала старые", value: "oldest" },
          { label: "По популярности", value: "popular" },
          { label: "По рейтингу", value: "rating" },
        ];

  const availableOptions = options ?? defaultOptions;

  const [selected, setSelected] = useState(availableOptions[0].label);
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const updateQueryParam = async (value: string) => {
    if (endpoint) {
      const apiParams = new URLSearchParams();
      apiParams.set("sort", value);
      if (mfoSlug) apiParams.set("mfo_slug", mfoSlug); // <-- передаём slug

      try {
        const response = await fetch(`${endpoint}?${apiParams.toString()}`);
        const data = await response.json();
        console.log(data);

        // Здесь можно обновить состояние отзывов
      } catch (error) {
        console.error("Ошибка запроса:", error);
      }
    }

    const urlParams = new URLSearchParams(searchParams.toString());
    urlParams.set("sort", value);
    router.push(`?${urlParams.toString()}`);
  };

  return (
    <div className="relative my-5 w-full sm:w-[170px] group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer h-[40px] w-full px-[10px] py-[11px] bg-white border border-[#BCBCCC] rounded-[8px] flex justify-between items-center text-[12px] font-medium text-[#222] leading-[142%] group-hover:bg-[#f0f0f0] transition-colors duration-200"
      >
        {selected}
        <svg
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          width="14"
          height="9"
          viewBox="0 0 14 9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.25 1.9082L7 7L1.75 1.9082"
            stroke="#BCBCCC"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="absolute left-0 top-[110%] w-full bg-white border border-[#BCBCCC] rounded-[8px] shadow-md z-10">
          {availableOptions.map(({ label, value }) => (
            <li
              key={value}
              onClick={() => {
                setSelected(label);
                setIsOpen(false);
                updateQueryParam(value);
                onChange?.(value); // <== добавь это
              }}
              className={`px-[10px] py-[8px] text-[12px] text-[#222] font-normal hover:bg-[#f0f0f0] cursor-pointer leading-[142%] ${
                selected === label ? "bg-[#f0f0f0]" : ""
              }`}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
