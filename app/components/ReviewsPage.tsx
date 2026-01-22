"use client";

import React from "react";
import ButtonGreenBorder from "../ui/ButtonGreenBorder";
import OftenQuestions from "../components/OftenQuestions";
import Questions from "../components/Home/Questions";
import InfoHelpfulClient from "../components/InfoHelpfulClient";
import Dropdown from "../ui/Dropdown";
import Bread from "../components/Bread";
import { useTranslations } from "next-intl";
import ReviewsList from "./ReviewsList";
import { AuthorRandomResponse } from "../services/authorsService";
import { ReviewStatisticsResponse } from "../services/reviewService";
import { FaqsResponse } from "../services/FaqService";
import { SettingsGroupResponse } from "../services/settingsService";

type ReviewsClientProps = {
	locale: string;
	reviewsCount: number;
	selectedSortKey: string; // из URL
	randomAuthor: AuthorRandomResponse;
	stats: ReviewStatisticsResponse;
	faqs: FaqsResponse;
	getAllSettings: SettingsGroupResponse | undefined;
};

const INCREMENT = 8;

const ReviewsClient: React.FC<ReviewsClientProps> = ({
	locale,
	reviewsCount,
	selectedSortKey,
	randomAuthor,
	stats,
	faqs,
	getAllSettings,
}) => {
	const t = useTranslations("ReviewsPage");

	const options =
		locale === "ua"
			? [
					{ label: "Спочатку нові", value: "newest" },
					{ label: "За корисністю", value: "helpful" },
					{ label: "За рейтингом ↓", value: "rating_desc" },
					{ label: "За рейтингом ↑", value: "rating_asc" },
			  ]
			: [
					{ label: "Сначала новые", value: "newest" },
					{ label: "По полезности", value: "helpful" },
					{ label: "По рейтингу ↓", value: "rating_desc" },
					{ label: "По рейтингу ↑", value: "rating_asc" },
			  ];

	return (
		<>
			<Bread lang={locale as "ua" | "ru"} />

			<div className="px-0 md:px-[20px]">
				<div className="p-[10px] sm:p-[20px] md:p-[30px] mb-[20px] sm:mb-[50px] md:mb-[50px] bg-white rounded-lg">
					<h1
						className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[25px] md:mb-[30px]"
						style={{ fontFamily: "var(--Jakarta)" }}
					>
						{getAllSettings?.settings.reviews_page_title ||
							t("title") ||
							"Все отзывы об МФО Украины"}
					</h1>
					<p
						className="text-[11px] sm:text-[12px] md:text-[13px] font-[500] leading-[138%] text-[#222]"
						style={{ fontFamily: "var(--Montserrat)" }}
					>
						{getAllSettings?.settings.reviews_page_description ||
							t("description") ||
							"Клиенты микрокредитной компании «Екапуста» получают доступ в личный кабинет. Это сервис, через который можно управлять займом, оплачивать его, переносить даты возврата. ЛК работает бесплатно и доступен везде, где есть выход в интернет."}
					</p>

					<div className="flex gap-[40px] mt-[20px]">
						<div className="flex flex-col">
							<p className="font-bold text-[20px] sm:text-[28px] md:text-[36px] leading-[100%] text-[#222]">
								{stats.total_mfos ?? ""}
							</p>
							<p className="font-medium text-[11px] leading-[145%] text-[#222]">
								{t("companies") || "Компаний"}
							</p>
						</div>
						<div className="flex flex-col">
							<p className="font-bold text-[20px] sm:text-[28px] md:text-[36px] leading-[100%] text-[#222]">
								{stats.total_reviews ?? ""}
							</p>
							<p className="font-medium text-[11px] leading-[145%] text-[#222]">
								{t("reviews") || "Отзывов"}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="px-0 md:px-[20px]">
				<Dropdown options={options} lang={locale as "ua" | "ru"} />
			</div>
			<ReviewsList
				locale={locale}
				reviewsCount={reviewsCount}
				selectedSortKey={selectedSortKey}
			/>
			{(stats.total_reviews ?? 0) > reviewsCount && (
				<div className="px-0 md:px-[20px]">
					<a
						href={`?count=${Math.min(
							reviewsCount + INCREMENT,
							stats.total_reviews ?? 0
						)}`}
					>
						<ButtonGreenBorder
							text={
								(stats.total_reviews ?? 0) - reviewsCount <=
								INCREMENT
									? t("showAll") || "Показать все"
									: t("showMore") || "Показать еще"
							}
							className="mt-[20px] mx-auto"
							width="256px"
						/>
					</a>
				</div>
			)}

			{faqs && faqs.length > 0 ? (
				<OftenQuestions faqs={faqs} />
			) : (
				<OftenQuestions />
			)}
			<InfoHelpfulClient randomAuthor={randomAuthor} locale={locale} />
			<Questions />
		</>
	);
};

export default ReviewsClient;
