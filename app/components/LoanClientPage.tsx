"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import {
	GetCatalogListResponse,
	CatalogPageFull,
	FaqItem,
	GetCatalogBySlugResponse,
} from "../services/catalogService";
import { MfoDetails } from "../services/getMfoDetailsService";
import { PageDatesResponse } from "../services/PageDatesService";
import { AuthorRandomResponse } from "../services/authorsService";
import { SettingsGroupResponse } from "../services/settingsService";
import { HomeData } from "../services/HomeService";

// Lazy load heavy components for better performance
const Bread = dynamic(() => import("../components/Bread"), {
	loading: () => <div className="h-[40px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const Dropdown = dynamic(() => import("../ui/Dropdown"), {
	loading: () => <div className="h-[50px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const AboutButtons = dynamic(() => import("../components/Loan/AboutButtons").then(mod => ({ default: mod.AboutButtons })), {
	loading: () => <div className="h-[100px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const CreditsList = dynamic(() => import("./CreditsList"), {
	loading: () => <div className="h-[400px] animate-pulse bg-gray-200 rounded" />,
	ssr: false, // Client-side only as it uses hooks
});

const OftenQuestions = dynamic(() => import("../components/OftenQuestions"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const Questions = dynamic(() => import("../components/Home/Questions"), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const InfoHelpfulClient = dynamic(() => import("./InfoHelpfulClient"), {
	loading: () => <div className="h-[150px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const DetailsText = dynamic(() => import("./DetailsText"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const LastReviews = dynamic(() => import("./Home/LastRewiews").then(mod => ({ default: mod.LastReviews })), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

type LoanClientPageProps = {
	visibleCount: number;
	homeData?: HomeData;
	locale: string;
	data: GetCatalogListResponse;
	page?: CatalogPageFull;
	mfos?: MfoDetails[];
	dates?: PageDatesResponse;
	slug?: string;
	faqs?: FaqItem[];
	randomAuthor: AuthorRandomResponse;
	getAllSettings: SettingsGroupResponse | undefined;
	dataBySlug?: GetCatalogBySlugResponse;
};

const LoanClientPage: React.FC<LoanClientPageProps> = ({
	visibleCount,
	locale,
	data,
	dataBySlug,
	dates,
	slug,
	faqs,
	homeData,
	randomAuthor,
	getAllSettings,
	page,
}) => {
	const [currentVisibleCount, setVisibleCount] = useState(visibleCount);
	const t = useTranslations("Loans");

	const options =
		locale === "ua"
			? [
					{ label: "За рейтингом ↓", value: "rating" },
					{ label: "За сумою ↑", value: "amount_asc" },
					{ label: "За сумою ↓", value: "amount_desc" },
					{ label: "За ставкою ↑", value: "rate_asc" },
					{ label: "За ставкою ↓", value: "rate_desc" },
			  ]
			: [
					{ label: "По рейтингу ↓", value: "rating" },
					{ label: "По сумме ↑", value: "amount_asc" },
					{ label: "По сумме ↓", value: "amount_desc" },
					{ label: "По ставке ↑", value: "rate_asc" },
					{ label: "По ставке ↓", value: "rate_desc" },
			  ];

	const handleShowMore = () => {
		setVisibleCount((prev) => prev + 3);
	};

	return (
		<>
			<Bread lang={locale as "ru" | "ua"} />
			<div className="px-0 md:px-[20px]">
				<div className="p-[10px] sm:p-[20px] md:p-[30px] mb-[20px] md:mb-[30px] bg-white rounded-lg mt-[10px] md:mt-[30px]">
					<h1 className="mb-[20px] font-bold text-[20px] md:text-[36px] leading-[100%] text-[#222]">
						{page?.h1_title
							? page.h1_title
							: getAllSettings?.settings.loan_page_title
							? getAllSettings.settings.loan_page_title
							: t("title") || "Займы"}
					</h1>
					{page?.description_under_title ? (
						<div
							className="font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]"
							dangerouslySetInnerHTML={{
								__html: page.description_under_title,
							}}
						/>
					) : (
						<p className="font-medium text-[13px] md:text-[15px] leading-[133%] text-[#222]">
							{getAllSettings?.settings.loan_page_description ||
								t("description")}
						</p>
					)}
				</div>
			</div>

			<AboutButtons data={data} dataBySlug={dataBySlug!} />

			<div className="px-0 md:px-[20px]">
				<Dropdown options={options} lang={locale as "ua" | "ru"} />
			</div>

			<CreditsList
				catalogPageSlug={
					dataBySlug?.data?.catalog?.slug
						? dataBySlug.data.catalog.slug
						: slug
						? `loan/${slug}`
						: undefined
				}
				locale={locale}
				visibleCount={currentVisibleCount}
				handleShowMore={handleShowMore}
			/>

			{homeData && (
				<LastReviews recent_reviews={homeData.recent_reviews} />
			)}

			<DetailsText html={dataBySlug?.page.seo_text} />
			{faqs && faqs.length > 0 ? (
				<OftenQuestions faqs={faqs} />
			) : (
				<OftenQuestions />
			)}
			<InfoHelpfulClient locale={locale} randomAuthor={randomAuthor} />

			<Questions />
			<div className="px-0 md:px-[20px]">
				<p className="font-medium text-[13px] mt-[50px] leading-[138%] text-[#67677a]">
					{dates?.date_published
						? t("metadata.addedDate") +
						  " " +
						  new Date(dates.date_published).toLocaleDateString(
								"ru-RU",
								{
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								}
						  )
						: t("metadata.addedDate")}
				</p>
				<p className="font-medium text-[13px] leading-[138%] text-[#67677a]">
					{dates?.date_modified && dates.date_modified !== dates?.date_published
						? t("metadata.updatedDate") +
						  " " +
						  new Date(dates.date_modified).toLocaleDateString(
								"ru-RU",
								{
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								}
						  )
						: t("metadata.updatedDate") +
						  " " +
						  new Date().toLocaleDateString("ru-RU", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
						  })}
				</p>
			</div>
		</>
	);
};

export default LoanClientPage;
