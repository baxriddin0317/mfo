"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  GetCatalogBySlugResponse,
  GetCatalogListResponse,
} from "@/app/services/catalogService";

type AboutButtonsProps = {
  data: GetCatalogListResponse;
  dataBySlug: GetCatalogBySlugResponse;
};

export const AboutButtons = ({ dataBySlug }: AboutButtonsProps) => {
  const pathname = usePathname(); // получаем текущий путь
  const router = useRouter();

  const handleButtonClick = (slug?: string) => {
    if (!slug) return;

    if (pathname.endsWith(`/${slug}`)) return;

    router.push(slug);
  };


  return (
    <div className="w-full no-scrollbar overflow-x-auto px-0 md:px-[20px]">
      <div className="flex gap-[10px]">
        {dataBySlug.page.fast_links.map((key, index) => {
          return (
            <button
              key={index}
              onClick={() => handleButtonClick(key.url)}
              className="cursor-pointer whitespace-nowrap text-white rounded-[35px] p-[8px_14px] flex items-center justify-center font-medium text-[15px] leading-[133%]"
              style={{
                backgroundColor: key.color,
              }}
            >
              <span className="flex items-center gap-2">{key.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
