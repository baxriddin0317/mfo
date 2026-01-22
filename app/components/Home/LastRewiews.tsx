"use client";
import React from "react";
import Image from "next/image";
import ButtonGreenBorder from "@/app/ui/ButtonGreenBorder";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Review } from "@/app/services/HomeService";
import Link from "next/link";
import { localePrefix } from "@/app/config/routesMap";

type Props = {
  recent_reviews: Review[];
  companyName?: string;
  companySlug?: string;
  companyLogo?: string;
};

export const LastReviews: React.FC<Props> = ({
  recent_reviews,
  companyName,
  companySlug,
  companyLogo,
}) => {
  const t = useTranslations("LastReviews");
  const pathname = usePathname();
  const lang = useLocale();

  const title = companyName
    ? t("lastMfoReviews", { company: companyName })
    : pathname.startsWith("/mfo/") && pathname.split("/").length === 3
    ? t("sectionTitleMFO")
    : t("sectionTitle");

  const displayedReviews = recent_reviews
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 4);

  const buttonLink = companySlug
    ? `${localePrefix(lang)}/mfo/${companySlug}/reviews`
    : `${localePrefix(lang)}/reviews`;

  if (displayedReviews.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-[30px] md:mb-[60px] px-[0px] md:px-[20px]" style={{ contain: 'layout' }}>
      <h2
        className="text-[20px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] md:mb-[30px]"
        style={{ fontFamily: "var(--Jakarta)" }}
      >
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
        {displayedReviews.map((el, index) => (
          <div
            key={index}
            className="w-full rounded-lg bg-white p-[10px] min-h-[243px] md:p-[16px] shadow-md"
            style={{ minHeight: '243px' }}
          >
            <div className="flex gap-[10px] mb-[14px]">
              <div className="w-[34px] h-[34px] flex-shrink-0">
              <Image
                src={el.mfo?.logo_url || companyLogo || ""}
                alt="logo"
                className="object-contain"
                width={34}
                height={34}
                  style={{ width: '34px', height: '34px' }}
              />
              </div>
              <div className="flex flex-col">
                <h4
                  className="font-[700] text-[12px] leading-[142%] text-[#222]"
                  style={{ fontFamily: "var(--Montserrat)" }}
                >
                  {el.mfo?.name || companyName}
                </h4>
                <p
                  className="font-[700] text-[16px] leading-[100%] text-[#724dea]"
                  style={{ fontFamily: "var(--Manrope)" }}
                >
                  {el.rating} <span className="text-[#67677a]">из 5</span>
                </p>
              </div>
            </div>

            <p
              className="font-[700] text-[12px] md:text-[15px] leading-[142%] text-[#222] mb-[10px]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {el.author_name}
            </p>

            <p
              className="mb-[10px] text-[13px] md:text-[15px] line-clamp-5"
              style={{
                fontFamily: "var(--Montserrat)",
                fontWeight: 500,
                lineHeight: "138%",
                color: "#222",
              }}
            >
              {el.review_text}
            </p>

            <Link href={`${localePrefix(lang)}/mfo/${el.mfo?.slug || companySlug}/reviews`}>
              <p
                className="text-[13px] w-max md:text-[15px] cursor-pointer underline text-[#6239e8] transition-colors duration-200 hover:text-[#9278ea]"
                style={{
                  fontFamily: "var(--Montserrat)",
                  fontWeight: 500,
                  lineHeight: "138%",
                  textDecorationSkipInk: "none",
                }}
              >
                {t("showFull")}
              </p>
            </Link>
          </div>
        ))}
      </div>

      <ButtonGreenBorder
        link={buttonLink}
        width={"100%"}
        text={t("button")}
        className="mt-[40px] sm:mt-[60px]"
      />
    </div>
  );
};
