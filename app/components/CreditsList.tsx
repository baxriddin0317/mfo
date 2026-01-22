"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";

import ButtonGreenBorder from "../ui/ButtonGreenBorder";
import { getMFOs } from "../services/mfosService";
import { MfoDetails } from "../services/getMfoDetailsService";
import { localePrefix } from "@/app/config/routesMap";
import CreditsListStructuredData from "../structured-data/CreditsListStructuredData";

type CreditsListProps = {
  locale: string;
  visibleCount: number;
  catalogPageSlug?: string;
  handleShowMore: () => void;
};

const CreditsList: React.FC<CreditsListProps> = ({
  catalogPageSlug,
  locale,
  visibleCount,
  handleShowMore,
}) => {
  const t = useTranslations("Loans");

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [credits, setCredits] = useState<MfoDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const formatAmount = (amount: string | number | null | undefined): string => {
    if (!amount) return "-";
    const amountStr = amount.toString();
    return amountStr.replace(/\.00$/, "");
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating || rating <= 0) return [];
    const starCount = Math.floor(rating);
    return Array.from({ length: starCount }, (_, index) => (
      <Image
        key={index}
        src="/Frame 5.svg"
        height={14}
        width={14}
        alt="star"
        className="w-[14px] h-[14px]"
      />
    ));
  };

  // Получаем параметр сортировки из URL или используем значение по умолчанию
  const sortParam = searchParams.get("sort") || "rating";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const data = await getMFOs({
          lang: locale === "ua" ? "uk" : "ru",
          ...(catalogPageSlug ? { catalog_page: catalogPageSlug } : {}),
          sort: sortParam as
            | "rating"
            | "amount_asc"
            | "amount_desc"
            | "rate_asc"
            | "rate_desc",
        });
        setCredits(data);
      } catch (error) {
        console.error("Ошибка загрузки кредитов:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [locale, sortParam, catalogPageSlug]);

  const pageTitle =
    catalogPageSlug && t(`${catalogPageSlug}.title`)
      ? t(`${catalogPageSlug}.title`)
      : t("catalogTitle") || "Каталог МФО";

  const pageUrl = `https://mfoxa.com.ua${
    locale === "ru" ? "/ru" : ""
  }${pathname}`;

  return (
    <>
      <CreditsListStructuredData
        credits={credits}
        pageTitle={pageTitle}
        pageUrl={pageUrl}
      />
      <div className="px-0 md:px-[20px] mb-5">
        {loading ? (
          <p>{t("loading") || "Загрузка..."}</p>
        ) : credits.length === 0 ? (
          <p>{t("noData") || "Нет доступных кредитов"}</p>
        ) : (
          <div className="flex justify-between flex-col gap-[20px] md:grid md:grid-cols-2 lg:grid-cols-3">
            {credits.slice(0, visibleCount).map((loan, index) => (
              <div
                key={index}
                className="w-full h-auto rounded-[20px] bg-white p-[10px] md:p-[16px] shadow-md hover:shadow-lg transition-shadow duration-300 flex-shrink-0"
                style={{ contain: 'layout' }}
              >
                <header className="flex gap-[10px] items-center mb-[10px]">
                  <div className="w-[89px] h-[50px] flex-shrink-0">
                  <Image
                    src={loan.logo_url || "/placeholder-logo.svg"}
                    alt={loan.name || "MFO"}
                      width={89}
                    height={50}
                    className="w-[89px] h-[50px] object-contain"
                      style={{ width: '89px', height: '50px' }}
                  />
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <h4 className="text-[#222] font-bold text-[16px] leading-[100%]">
                      {loan.name || "-"}
                    </h4>
                    <div className="flex flex-row xl:flex-row md:flex-col gap-[5px]">
                      <div className="flex items-center gap-[2px]">
                        <div className="flex gap-[2px]">
                          {renderStars(loan.rating_average)}
                        </div>
                        <p className="text-[13px] text-[#222] font-medium leading-[138%]">
                          {loan.rating_average ?? "-"}
                          <span className="text-[#67677a]">/5</span>
                        </p>
                      </div>
                      <Link
                        href={`${localePrefix(
                          locale,
                        )}/mfo/${loan.slug}/reviews`}
                      >
                        <p className="text-[13px] text-[#00ba9e] font-medium leading-[138%]">
                          {loan.rating_count + " " + t("reviews")}
                        </p>
                      </Link>
                    </div>
                  </div>
                </header>

                <main className="flex flex-col gap-[10px]">
                  {loan.catalog_offers
                    ?.filter(
                      (offer) =>
                        offer.client_type === "new" ||
                        offer.client_type === "repeat",
                    )
                    .map((offer, i) => (
                      <div
                        key={i}
                        className={`border ${
                          offer.client_type === "new"
                            ? "border-[#00ba9e]"
                            : "border-[#724DEA]"
                        } rounded-[8px] p-[7px] md:p-[12px]`}
                      >
                        <p
                          className={`text-[12px] font-bold ${
                            offer.client_type === "new"
                              ? "text-[#00ba9e]"
                              : "text-[#724DEA]"
                          }`}
                        >
                          {offer.client_type === "new"
                            ? t("newLoan")
                            : t("repeatLoan") || "-"}
                        </p>
                        <div className="border-t border-[#e0e0e0] mt-[10px] pt-[10px] flex justify-center items-center gap-[10px] text-center">
                          <div className="flex flex-col text-[12px]">
                            <p className="text-[#67677a] font-medium">
                              {t("amount") || "Сумма"}
                            </p>
                            <p className="text-[#222] font-bold">
                              {offer.amount_from
                                ? `від ${formatAmount(offer.amount_from)}`
                                : "-"}{" "}
                              до {formatAmount(offer.amount_to)}
                            </p>
                          </div>
                          <div className="flex flex-col text-[12px]">
                            <p className="text-[#67677a] font-medium">
                              {t("term") || "Срок"}
                            </p>
                            <p className="text-[#222] font-bold">
                              {offer.term_from && offer.term_to
                                ? `${offer.term_from} - ${offer.term_to} днів`
                                : "-"}
                            </p>
                          </div>
                          <div className="flex flex-col text-[12px]">
                            <p className="text-[#67677a] font-medium">
                              {t("rate") || "Ставка"}
                            </p>
                            <p className="text-[#222] font-bold">
                              {formatAmount(offer.rate)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {loan.credit_offers?.repeat_client && (
                    <div className="border border-[#724DEA] rounded-[8px] p-[7px] md:p-[12px]">
                      <p className="text-[#724DEA] text-[12px] font-bold">
                        {t("repeatLoan") || "Повторный кредит"}
                      </p>
                      <div className="border-t border-[#e0e0e0] mt-[10px] pt-[10px] flex justify-center items-center gap-[10px] text-center">
                        <div className="flex flex-col text-[12px]">
                          <p className="text-[#67677a] font-medium">
                            {t("amount") || "Сумма"}
                          </p>
                          <p className="text-[#222] font-bold">
                            {formatAmount(
                              loan.credit_offers.repeat_client.amount
                                ?.formatted,
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col text-[12px]">
                          <p className="text-[#67677a] font-medium">
                            {t("term") || "Срок"}
                          </p>
                          <p className="text-[#222] font-bold">
                            {loan.credit_offers.repeat_client.term?.formatted ??
                              "-"}
                          </p>
                        </div>
                        <div className="flex flex-col text-[12px]">
                          <p className="text-[#67677a] font-medium">
                            {t("rate") || "Ставка"}
                          </p>
                          <p className="text-[#222] font-bold">
                            {loan.credit_offers.repeat_client.rate?.formatted ??
                              "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-[10px] text-[12px] text-[#9393a3]">
                    <div className="flex justify-between">
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        РРС
                      </p>
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        {loan.quick_info?.rpc_range ?? "-"}
                      </p>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        Юр. лицо
                      </p>
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        {loan.legal_entity ?? "-"}
                      </p>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        Лицензия НБУ
                      </p>
                      <p className="text-[10px] font-medium leading-[120%] text-[#9393a3]">
                        {loan.nbu_license ?? "-"}
                      </p>
                    </div>
                    <hr />
                    <div>
                      <Link
                        href={loan.basic_characteristics_pdf_url || ""}
                        className="underline text-[10px] font-medium leading-[120%] text-[#00ba9e]"
                        style={{
                          fontFamily: "var(--Montserrat)",
                          textDecorationSkipInk: "none",
                        }}
                        target="_blank"
                      >
                        {t("termsLink") || "Условия"}
                      </Link>
                    </div>
                    <hr />
                    <div>
                      <Link
                        href={loan.user_warning_pdf_url || ""}
                        className="underline text-[10px] font-medium leading-[120%] text-[#00ba9e]"
                        style={{
                          fontFamily: "var(--Montserrat)",
                          textDecorationSkipInk: "none",
                        }}
                        target="_blank"
                      >
                        {t("warningLink") || "Предупреждение"}
                      </Link>
                    </div>
                  </div>
                </main>

                <footer className="mt-[10px] flex sm:flex-row gap-[10px] items-center justify-between flex-wrap">
                  <ButtonGreenBorder
                    link={`${localePrefix(locale)}/mfo/${loan.slug}`}
                    width="100%"
                    text={t("details") || "Подробности"}
                    className="flex-1"
                  />
                  <Link
                    href={`${loan.get_money_button_url}`}
                    target="_blank"
                    className="bg-[#00ba9e] hover:bg-[#009d85] transition-all duration-200 ease-in-out whitespace-nowrap flex-1 text-white font-bold text-[14px] rounded-[8px] px-[32px] py-[10px] w-full sm:w-[235px] text-center cursor-pointer"
                  >
                    {t("getMoney") || "Получить деньги"}
                  </Link>
                </footer>
              </div>
            ))}
          </div>
        )}
      </div>
      {credits.length > visibleCount && (
        <div className="px-0 mb-5 md:px-[20px]">
          <ButtonGreenBorder
            text={t("showMore") || "Показать еще"}
            width="100%"
            className="sm:!w-[256px]"
            onClick={handleShowMore}
          />
        </div>
      )}
    </>
  );
};

export default CreditsList;
