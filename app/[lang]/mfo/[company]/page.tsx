/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";
import Bread from "@/app/components/Bread";
import { Metadata } from "next";
import { MicrodataCompany } from "@/app/structured-data/MicrodataCompany";
import { getTranslations } from "next-intl/server";
import { getMfoDetails } from "@/app/services/getMfoDetailsService";
import { getPageDates } from "@/app/services/PageDatesService";
import { MicrodataCalculator } from "@/app/structured-data/MicrodataCalculator";
import { MicrodataLoanOrCredit } from "@/app/structured-data/MicrodataLoanOrCredit";
import { ScrollReset } from "@/app/components/ScrollReset";
import ClientOnly from "@/app/components/ClientOnly";
import { localePrefix } from "@/app/config/routesMap";
import { LangType } from "@/app/services/HomeService";
import { generateAlternates } from "@/app/lib/metadataUtils";
import axios from "axios";

// Lazy load heavy components for better initial load performance
const OftenQuestions = dynamic(() => import("@/app/components/OftenQuestions"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const AboutButtons = dynamic(() => import("@/app/components/AboutButtons"), {
	loading: () => <div className="h-[100px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const TariffCalculatorWrapper = dynamic(() => import("@/app/components/Catalog/Calculator").then(mod => ({ default: mod.TariffCalculatorWrapper })), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const TermsOfRegistration = dynamic(() => import("@/app/components/TermsOfRegistration"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const DetailsText = dynamic(() => import("@/app/components/DetailsText"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const LastReviews = dynamic(() => import("@/app/components/Home/LastRewiews").then(mod => ({ default: mod.LastReviews })), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

export const revalidate = 60;

interface PageProps {
  params: Promise<{ lang: string; company: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang, company } = await params;
  const slug = decodeURIComponent(company);

  // Use meta_title and meta_description from API data
  let title: string;
  let description: string;

  try {
    const { data } = await getMfoDetails(slug, lang === "ua" ? "uk" : "ru");

    // Use meta_title and meta_description from API
    title = data.meta_title || `Кредит в МФО ${data.name}`;
    description = data.meta_description || `Детальна інформація про компанію МФО ${data.name}`;
  } catch (error) {
    // If company not found (404), show 404 page
    if (
      (error as { status?: number })?.status === 404 ||
      (error instanceof Error && error.message.includes("Not Found"))
    ) {
      notFound();
    }
    
    console.error("Ошибка при получении данных MFO:", error);
    // For other errors, throw to show error page
    throw error;
  }

  const alternates = generateAlternates(["mfo", slug], lang);

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "MFoxa",
      type: "website",
      images: [`https://mfoxa.com.ua/og-${slug}.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://mfoxa.com.ua/og-${slug}.jpg`],
    },
  };
}

export default async function CatalogPage({ params }: PageProps) {
  const { lang, company } = await params;
  const companySlug = decodeURIComponent(company || "sgroshi");
  const locale = lang;

  const t = await getTranslations({ locale: lang, namespace: "Catalog" });
  
  let data;
  try {
    const result = await getMfoDetails(
      companySlug,
      locale === "ua" ? "uk" : "ru",
    );
    data = result.data;
  } catch (error) {
    // Check for 404 status
    if (
      (error as { status?: number })?.status === 404 ||
      (axios.isAxiosError(error) && error.response?.status === 404)
    ) {
      notFound();
    }
    throw error;
  }

  console.log("data", data);

  const requirements = data.requirements;


  const requirementsData = [
    {
      key: "age",
      label: t("borrower.age"),
      value:
        requirements?.age_min && requirements?.age_max
          ? t("borrower.ageValue", {
              min: requirements.age_min,
              max: requirements.age_max,
            })
          : t("borrower.ageValue", { min: 18, max: 75 }),
    },
    {
      key: "documents",
      label: t("borrower.documents"),
      value:
        requirements?.documents
          .map((document: string) => document)
          .join(", ") || t("borrower.documentsValue"),
    },
    {
      key: "citizenship",
      label: t("borrower.citizenship"),
      value:
        requirements?.residency_requirement || t("borrower.citizenshipValue"),
    },
    {
      key: "collateral",
      label: t("borrower.collateral"),
      value: requirements?.collateral_required
        ? t("borrower.collateralValue")
        : t("borrower.collateralValueNo"),
    },
    {
      key: "guarantor",
      label: t("borrower.guarantor"),
      value: requirements?.guarantor_required
        ? t("borrower.guarantorValue")
        : t("borrower.guarantorValueNo"),
    },
    {
      key: "employment",
      label: t("borrower.employment"),
      value: requirements?.official_employment_required
        ? t("borrower.employmentValue")
        : t("borrower.employmentValueNo"),
    },
  ];

  const dates = data?.id
    ? await getPageDates({ type: "mfo", mfo_id: data.id })
    : null;

  return (
    <>
      <ClientOnly>
        <ScrollReset />
      </ClientOnly>
      <MicrodataCompany
        lang={lang as LangType}
        company={companySlug}
        data={data}
        dates={dates}
      />
      <Bread lang={lang as "ua" | "ru"} companyName={data.name} />
      <div className="px-0 md:px-[20px]">
        <div className="p-[10px] md:p-[30px] sm:p-[20px] mb-[30px] md:mb-[50px] bg-white rounded-lg mt-[10px]">
          <div className="flex justify-between flex-col md:flex-row md:items-center">
            <div className="flex gap-[10px] md:p-[30px] sm:p-[20px] mb-[16px] md:mb-[40px]">
              <div className="relative w-[89px] md:w-[219px] aspect-[219/70]">
                <Image
                  src={data.logo_url}
                  alt={t("imageAlt")}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="font-bold text-[16px] md:text-[30px] leading-[100%] mb-[10px] text-[#222]">
                  {data?.h1_title || data?.name || "name"}
                </h1>
                <div className="flex gap-[5px] items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <svg
                        key={i}
                        width="14"
                        height="16"
                        viewBox="0 0 14 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 1.99988L8.5716 6.83676H13.6574L9.5429 9.82612L11.1145 14.663L7 11.6736L2.8855 14.663L4.4571 9.82612L0.342604 6.83676H5.4284L7 1.99988Z"
                          fill={
                            i < Math.floor(Number(data.rating_average))
                              ? "#00BA9E"
                              : "#E6E6EB"
                          }
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="font-medium text-[13px] leading-[138%] text-[#222]">
                    {data.rating_average || t("rating.value")}
                    <span className="text-[#67677a]">/5</span>
                  </p>
                  <Link
                    href={`${localePrefix(locale)}/mfo/${data.slug}/reviews`}
                  >
                    <p className="font-medium text-[13px] leading-[138%] underline underline-offset-2 text-right text-[#00ba9e] hover:text-[#009e88] hover:underline-offset-4 transition-all duration-200 cursor-pointer">
                      {data.rating_count + " " + t("rating.reviews")}
                    </p>
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href={data.get_money_button_url || "/"}
              target="_blank"
              className="block bg-[#00ba9e] hover:bg-[#009d85] transition-all duration-200 ease-in-out mb-[20px] md:mb-0 whitespace-nowrap h-[40px] w-full md:w-[200px] text-white font-bold text-[14px] rounded-[8px] px-[32px] py-[10px] sm:w-[235px] text-center cursor-pointer"
            >
              {t("getMoney")}
            </Link>
          </div>

          <h2 className="mb-[14px] md:mb-[30px] font-bold text-[20px] md:text-[36px] leading-[100%] text-[#222]">
            {t("about", {
              company: data.name || "name",
            })}
          </h2>
          <hr className="mb-[14px] md:mb-[30px]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 mb-[10px]">
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("legalEntity")}
              </p>
              <p className="font-bold text-[14px] leading-[136%] text-[#222]">
                {data.legal_entity || t(`company.${companySlug}.legalEntity`)}
              </p>
            </div>
            <hr className="block sm:hidden my-[14px]" />
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("phone")}
              </p>
              <p className="font-bold text-[14px] leading-[136%] text-[#222]">
                {data.phone || t("phoneValue")}
              </p>
            </div>
          </div>

          <hr className="mb-[14px] md:mb-[30px]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 mb-[10px]">
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("legalAddress")}
              </p>
              <p className="font-bold text-[14px] leading-[136%] text-[#222]">
                {data.legal_address || t("legalAddressValue")}
              </p>
            </div>
            <hr className="block sm:hidden my-[14px]" />
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("email")}
              </p>
              <p className="font-bold text-[14px] leading-[136%] text-[#222]">
                {data.email || t("emailValue")}
              </p>
            </div>
          </div>
          <hr className="mb-[14px] md:mb-[30px]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 mb-[10px]">
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("license")}
              </p>
              <p className="font-bold text-[14px] leading-[136%] text-[#222]">
                {data.nbu_license || t("licenseValue")}
              </p>
            </div>
            <hr className="block sm:hidden my-[14px]" />
            <div className="flex flex-col gap-[10px]">
              <p className="font-medium text-[11px] leading-[145%] text-[#67677a]">
                {t("website")}
              </p>
              <Link
                href={data.redirect_url}
                target="_blank"
                className="w-max font-medium text-[14px] leading-[136%] underline underline-offset-2 text-[#00ba9e]"
                style={{ textDecorationSkipInk: "none" }}
              >
                {data.official_website || t("websiteValue")}
              </Link>
            </div>
          </div>

          <p className="mb-[10px] font-medium text-[10px] leading-[140%] text-[#67677a]">
            {t("usefulMaterials")}
          </p>
          <Link
            href={data.basic_characteristics_pdf_url || t("termsLink")}
            target="_blank"
            className="block w-max font-medium text-[14px] leading-[136%] text-[#00ba9e]"
          >
            {t("termsText")}
          </Link>
          <Link
            href={data.user_warning_pdf_url || ""}
            target="_blank"
            className="w-max font-medium text-[14px] leading-[136%] text-[#00ba9e]"
          >
            {t("warningText")}
          </Link>
        </div>
      </div>
      <AboutButtons />
      <TermsOfRegistration mfo={data} />
      <div className="px-0 md:px-[20px]">
        <div className="flex flex-col md:flex-row w-full gap-[20px]">
          <div className="p-[10px] md:p-[30px] sm:p-[20px] w-full md:w-1/2 mb-[0px] md:mb-[50px] bg-white rounded-lg mt-[10px]">
            <h2
              className="text-[20px] md:text-[28px] font-[700] leading-[100%] text-[#222] mb-[30px]"
              style={{ fontFamily: "var(--Jakarta)" }}
            >
              {t("borrowerRequirements", {
                company: data.name || t(`company.${companySlug}.name`),
              })}
            </h2>
            {requirementsData.map((item, i) => (
              <React.Fragment key={i}>
                <div className="flex justify-between items-center">
                  <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
                    {item.label}
                  </p>
                  <div className="font-medium text-[14px] leading-[136%] text-right text-[#222]">
                    {item.value}
                  </div>
                </div>
                <hr className="mb-[16px]" />
              </React.Fragment>
            ))}
          </div>

          <div className="p-[10px] md:p-[30px] md:mt-[10px] sm:p-[20px] w-full md:w-1/2 md:mb-[50px] bg-white rounded-lg mb-[20px]">
            <h2
              className="text-[20px] md:text-[28px] font-[700] leading-[100%] text-[#222] mb-[30px]"
              style={{ fontFamily: "var(--Jakarta)" }}
            >
              {t("moneyMethodsCompany", {
                company: data.name || t(`company.${companySlug}.name`),
              })}
            </h2>
            {data.payment_methods
              .filter((method: { type: string }) => method.type === "receiving")
              .map(
                (
                  method: {
                    title: any;

                    description:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                  },
                  i: React.Key | null | undefined,
                ) => (
                  <React.Fragment key={i}>
                    <div className="flex gap-[10px]">
                      <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 3.91357L5.66667 12.4916L1 8.2026"
                          stroke="#00BA9E"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
                        {method.title}
                      </p>
                    </div>
                    <hr className="mb-[16px]" />
                  </React.Fragment>
                ),
              )}
          </div>
        </div>
      </div>
      <div className="px-0 md:px-[20px]">
        <div className="flex flex-col md:flex-row w-full gap-[20px]">
          <div className="p-[10px] flex-col gap-[20px] md:p-[30px] sm:p-[20px] w-full md:w-1/2  bg-white rounded-lg">
            <h2
              className="text-[20px] md:text-[28px] font-[700] leading-[100%] text-[#222] mb-[30px]"
              style={{ fontFamily: "var(--Jakarta)" }}
            >
              {t("calculatorCompany", {
                company: data.name || t(`company.${companySlug}.name`),
              })}
            </h2>
            <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
              {t("selectTariff")}
            </p>
            <MicrodataLoanOrCredit
              tariffs={data.tariffs}
              companyName={data.name || t(`company.${companySlug}.name`)}
              companySlug={companySlug}
              locale={lang as "ru" | "ua"}
            />
            <MicrodataCalculator
              companyName={data.name || t(`company.${companySlug}.name`)}
              locale={lang as "ru" | "ua"}
            />
            <TariffCalculatorWrapper tariffs={data.tariffs} />

            <p
              className="font-medium text-[11px] leading-[145%] mb-[10px] text-center text-[#9393a3]"
              style={{ fontFamily: "var(--Montserrat)" }}
            >
              {t("calculator.note")}
            </p>
            <Link
              href={data.redirect_url || "/"}
              target="_blank"
              className="block bg-[#00ba9e] hover:bg-[#009d85] transition-all duration-200 ease-in-out mx-auto h-[40px] w-full text-white font-bold text-[14px] rounded-[8px] px-[32px] py-[10px] sm:w-[235px] text-center cursor-pointer"
            >
              {t("getMoney")}
            </Link>
          </div>
          <div className="p-[10px] md:p-[30px] sm:p-[20px]  w-full md:w-1/2 bg-white rounded-lg">
            <h2
              className="text-[20px] md:text-[28px] font-[700] leading-[100%] text-[#222] mb-[30px]"
              style={{ fontFamily: "var(--Jakarta)" }}
            >
              {t("repaymentMethodsСompany", {
                company: data?.name || "name",
              })}
            </h2>
            {data.payment_methods
              .filter((method: { type: string }) => method.type === "repayment")
              .map(
                (
                  method: {
                    id: any;
                    title: any;
                    description:
                      | string
                      | number
                      | bigint
                      | boolean
                      | React.ReactElement<
                          unknown,
                          string | React.JSXElementConstructor<any>
                        >
                      | Iterable<React.ReactNode>
                      | React.ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | React.ReactPortal
                          | React.ReactElement<
                              unknown,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                  },
                  i: any,
                ) => (
                  <React.Fragment key={method.id || i}>
                    <div className="flex gap-[10px]">
                      <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 3.91357L5.66667 12.4916L1 8.2026"
                          stroke="#00BA9E"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <p className="font-medium mb-[13px] text-[14px] leading-[136%] text-[#67677a]">
                        {method.title}
                      </p>
                    </div>
                    <hr className="mb-[16px]" />
                  </React.Fragment>
                ),
              )}
          </div>
        </div>
      </div>
      <OftenQuestions faqs={data.faqs} company={data.name} />
      <div className="mb-[30px] md:mb-[50px]"></div>
      <LastReviews
        recent_reviews={data.recent_reviews || []}
        companyName={data.name}
        companySlug={data.slug}
        companyLogo={data.logo_url}
      />
      <div className="h-[30px]"></div>
      <DetailsText html={data.seo_text} />
      {/* <PageReview
				author={{ data: { name: "Эксперт MFoxa" } } as any}
				pageName={data.name}
			/> */}
      {/* <LastReviews recent_reviews={data.recent_reviews || []} /> <DetailsText /> */}
      <div className="px-0 md:px-[20px]">
        {data.created_at && (
          <p className="font-medium text-[13px] mt-[50px] leading-[138%] text-[#67677a]">
            {dates?.date_published
              ? t("metadata.addedDate") +
                " " +
                new Date(dates.date_published).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : t("metadata.addedDate")}
          </p>
        )}
        <p className="font-medium text-[13px] leading-[138%] text-[#67677a]">
          {(() => {
            // Используем ту же логику, что и в schema для синхронизации дат
            const dateModified = dates?.date_modified || data.updated_at;
            const datePublished = dates?.date_published || data.created_at;
            
            if (dateModified && dateModified !== datePublished) {
              return t("metadata.updatedDate") +
                " " +
                new Date(dateModified).toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
            }
            
            return t("metadata.updatedDate") +
              " " +
              new Date(dateModified || new Date().toISOString()).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              });
          })()}
        </p>
      </div>
    </>
  );
}
