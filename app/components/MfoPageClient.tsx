/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React from "react";
import dynamic from "next/dynamic";
import ButtonGreenBorder from "../ui/ButtonGreenBorder";

// Lazy load heavy components for better performance
const Bread = dynamic(() => import("../components/Bread"), {
	loading: () => <div className="h-[40px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const OftenQuestions = dynamic(() => import("../components/OftenQuestions"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const InfoHelpful = dynamic(() => import("../components/InfoHelpful"), {
	loading: () => <div className="h-[150px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const Questions = dynamic(() => import("../components/Home/Questions"), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const DetailsText = dynamic(() => import("../components/DetailsText"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});
// import { MfoListStructuredData } from "../structured-data/MfoListStructuredData";
// import { PageReview } from "../structured-data/PageReview";
import { PageDatesResponse } from "../services/PageDatesService";
import { MfoDetails } from "../services/getMfoDetailsService";
import { AuthorRandomResponse } from "../services/authorsService";
import { FaqsResponse } from "../services/FaqService";
import { SettingsGroupResponse } from "../services/settingsService";
import { localePrefix } from "../config/routesMap";

const getColor = (value: number): string => {
	if (value >= 0 && value < 1) return "#8B0000";
	if (value >= 1 && value < 2) return "#FF0000";
	if (value >= 2 && value < 3) return "#ffde33";
	if (value >= 3 && value < 4) return "#FFA500";
	if (value >= 4 && value <= 5) return "#00FF00";
	return "#8B0000";
};

const tops = [
	{ name: "Швидко гроші", img: "/2.svg" },
	{ name: "Credit 7", img: "/1.svg" },
	{ name: "SLON Credit", img: "/3.svg" },
	{ name: "Швидко гроші", img: "/2.svg" },
	{ name: "Credit 7", img: "/1.svg" },
	{ name: "SLON Credit", img: "/3.svg" },
	{ name: "Швидко гроші", img: "/2.svg" },
	{ name: "Credit 7", img: "/1.svg" },
	{ name: "SLON Credit", img: "/3.svg" },
];
console.log(tops);

type CircleRatingProps = {
	value: number;
	color: string;
};

const CircleRating: React.FC<CircleRatingProps> = ({ value, color }) => (
	<svg
		width="32"
		height="32"
		viewBox="0 0 50 50"
		role="img"
		aria-label={`Rating: ${value}`}
		className="w-8 h-8 flex-shrink-0 min-w-[32px] min-h-[32px]"
	>
		<circle
			cx="25"
			cy="25"
			r="23"
			stroke="#eee"
			strokeWidth="2"
			fill="none"
		/>
		<circle
			cx="25"
			cy="25"
			r="23"
			stroke={color}
			strokeWidth="4"
			fill="none"
			strokeDasharray={`${(value / 5) * 144}, 144`}
			transform="rotate(-90 25 25)"
			strokeLinecap="round"
		/>
		<text
			x="50%"
			y="50%"
			dominantBaseline="middle"
			textAnchor="middle"
			fontSize="14"
			fontWeight="bold"
			fill={color}
		>
			{value}
		</text>
	</svg>
);

type MfoPageClientProps = {
	translations: {
		mfo: (key: string, params?: any) => string;
		ratings: (key: string, params?: any) => string;
	};
	visibleCount?: number;
	isMobile: boolean;
	locale: string;
	dates: PageDatesResponse;
	data: MfoDetails[];
	randomAuthor: AuthorRandomResponse;
	faqs: FaqsResponse;
	getAllSettings: SettingsGroupResponse | undefined;
};

export default function MfoPageClient({
	translations,
	visibleCount = 3,
	isMobile,
	locale,
	dates,
	data,
	randomAuthor,
	faqs,
	getAllSettings,
}: MfoPageClientProps) {
	const { mfo, ratings: ratingsT } = translations;

	// const companies = tops.slice(0, visibleCount).map((top, index) => ({
	// 	name: top.name,
	// 	url: `https://mfoxa.com.ua/mfo/${encodeURIComponent(
	// 		top.name.toLowerCase().replace(/\s+/g, "-")
	// 	)}`,
	// 	ratingValue: 4.5,
	// 	reviewCount: 100 + index * 10,
	// 	position: index + 1,
	// }));
	const formatRating = (ratingStr: string | undefined) => {
		if (!ratingStr) return "";
		const rating = parseFloat(ratingStr);
		if (isNaN(rating)) return "";

		return rating.toFixed(1).replace(".", ",");
	};

	return (
		<>
			{/* <MfoListStructuredData companies={companies} /> */}
			<Bread lang={locale as "ua" | "ru"} />

			<div className="p-[10px] md:p-[30px] mb-[20px] sm:mb-[30px] md:mb-[50px] bg-white rounded-lg mx-[0px] md:mx-[20px]">
				<h1
					className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[25px] md:mb-[30px]"
					style={{ fontFamily: "var(--Jakarta)" }}
				>
					{getAllSettings?.settings.mfo_page_title || mfo("title")}
				</h1>
				<p
					className="text-[11px] sm:text-[12px] md:text-[13px] font-[500] leading-[138%] text-[#222]"
					style={{ fontFamily: "var(--Montserrat)" }}
				>
					{getAllSettings?.settings.mfo_page_description ||
						mfo("subtitle")}
				</p>
			</div>

			{data && data.length > 0 ? (
				isMobile ? (
					<div className="mx-[0px] md:mx-[20px] px-[0px] md:px-[20px] mb-[20px] flex flex-wrap gap-[20px]">
						{data
							.sort((a, b) => +b.rating_average - +a.rating_average)
							.slice(0, visibleCount)
							.map((top, i) => {
							const place = i + 1;

							let medalSrc = "/Frame 170.png"; // золото по умолчанию
							if (place === 1) medalSrc = "/Frame 163.png";
							if (place === 2) medalSrc = "/Silver.png";
							else if (place === 3) medalSrc = "/Bronze.png";

							return (
								<div
									key={i}
									className="w-full rounded-[20px] bg-white p-[10px] md:p-[16px] shadow-md"
								>
									<header className="flex gap-[10px] items-center mb-[10px]">
										<Image
											src={top.logo_url}
											alt={top.name}
											width={89}
											height={50}
											className="object-contain"
										/>
										<p className="text-[#222] font-bold text-[16px]">
											{top.name}
										</p>
									</header>
									<div className="flex items-center gap-[10px]">
										<div className="relative w-[74px] h-[74px]">
											<Image
												src={medalSrc}
												alt={`rating-place-${place}`}
												width={74}
												height={74}
												className="object-contain w-[74px] h-[74px] flex-shrink-0 min-w-[74px] min-h-[74px]"
											/>

											{/* Контент поверх PNG */}
											<div className="absolute inset-1 mt-2 md:mt-3 flex flex-col items-center justify-center">
												<span
													style={{
														color: getColor(
															top?.rating_average
														),
													}}
													className="text-[20px] font-bold leading-none"
												>
													{formatRating(
														String(
															top?.rating_average
														)
													)}
												</span>
												<span className="text-black text-[10px] font-bold">
													{place} {mfo("place")}
												</span>
											</div>
										</div>
										<div className="grid grid-cols-2 gap-[16px]">
											{Object.entries(top.ratings).map(
												([key, rating], index) => (
													<div
														key={index}
														className="flex gap-[10px] items-center"
														aria-label={`${ratingsT(
															key
														)}: ${rating.value}`}
													>
														<CircleRating
															value={rating.value}
															color={getColor(
																rating.value
															)}
														/>{" "}
														<div>
															<p className="text-[11px] font-medium text-[#222]">
																{rating.label ??
																	ratingsT(
																		key
																	)}
															</p>
														</div>
													</div>
												)
											)}
										</div>
									</div>
									<ButtonGreenBorder
										link={`${localePrefix(locale)}/mfo/${
											top.slug
										}`}
										className="mt-[20px]"
										width="100%"
										text={mfo("details")}
									/>
								</div>
							);
							})}
					</div>
				) : (
					<div className=" mx-[0px] md:mx-[20px] p-[10px] md:p-[30px] mb-[50px] bg-white rounded-lg mx-0md:mx-[20px] mt-[30px]">
						{data
							.sort((a, b) => +b.rating_average - +a.rating_average)
							.slice(0, visibleCount)
							.map((top, i) => {
							const place = i + 1;

							let medalSrc = "/Frame 171.png";
							if (place === 1)
								medalSrc = "/Frame%20166%20(1).svg";
							if (place === 2) medalSrc = "/Frame 167.svg";
							else if (place === 3) medalSrc = "/Frame 169.svg";

							return (
								<React.Fragment key={i}>
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-[20px]">
										<div className="flex gap-[10px] sm:gap-[20px] items-center">
											<div className="relative w-[150px] md:w-[210px]">
												<Image
													src={medalSrc}
													alt={`rating-place-${place}`}
													width={74}
													height={74}
													className="w-[150px] md:w-[210px] h-[120px] lg:h-[80px]"
												/>

												{/* Контент поверх PNG */}
												<div className="absolute inset-1 mt-3 gap-2 flex items-center justify-center lg:flex-row flex-col">
													<Image
														src={top.logo_url}
														alt={`rating-place-${place}`}
														width={74}
														height={74}
														className="object-contain !w-[60px] md:!w-[70px]"
													/>
													<div className="flex flex-col justify-center items-center">
														<span
															style={{
																color: getColor(
																	top?.rating_average
																),
															}}
															className="gap-1 text-[15px] font-bold leading-none"
														>
															{formatRating(
																String(
																	top?.rating_average
																)
															)}
														</span>
														<span className="text-black text-[10px] font-bold">
															{place} {mfo("place")}
														</span>
													</div>
												</div>
											</div>
											<div className="flex flex-col gap-[8px]">
												<p className="font-medium text-[15px] leading-[133%] text-[#222]">
													{mfo("ratingsTitle", {
														name: top.name,
													})}
												</p>
												<div className="grid lg:grid-cols-4 grid-cols-2 gap-[10px] md:gap-[16px] text-black text-sm">
													{Object.entries(
														top.ratings
													).map(
														(
															[key, rating],
															index
														) => (
															<div
																key={index}
																className="flex items-center gap-[10px]"
																aria-label={`${ratingsT(
																	key
																)}: ${
																	rating.value
																}`}
															>
																<CircleRating
																	value={
																		rating.value
																	}
																	color={getColor(
																		rating.value
																	)}
																/>
																<div className="flex flex-col">
																	<span
																		style={{
																			fontFamily:
																				"var(--Montserrat)",
																			fontWeight: 500,
																			fontSize:
																				"11px",
																			lineHeight:
																				"145%",
																			color: "#222",
																		}}
																	>
																		{rating.label ??
																			ratingsT(
																				key
																			)}
																	</span>
																	<p
																		style={{
																			fontFamily:
																				"var(--Montserrat)",
																			fontWeight: 500,
																			fontSize:
																				"11px",
																			lineHeight:
																				"145%",
																			color: "#9393a3",
																		}}
																	>
																		{mfo(
																			"rank",
																			{
																				rank: rating.position,
																			}
																		)}
																	</p>
																</div>
															</div>
														)
													)}
												</div>
											</div>
										</div>
										<div className="w-full md:w-1/5 lg:w-1/7">
											<ButtonGreenBorder
												link={`${localePrefix(
													locale
												)}/mfo/${top.slug}`}
												className="mt-[20px]"
												width="100%"
												text={mfo("details")}
											/>
										</div>
									</div>
									<hr className="mt-[14px] mb-[20px]" />
								</React.Fragment>
								);
							})}
					</div>
				)
			) : (
				<div className="mx-[0px] md:mx-[20px] p-[10px] md:p-[30px] mb-[50px] bg-white rounded-lg mt-[30px]">
					<p className="text-center text-[#222] font-medium text-[16px] py-[40px]">
						{mfo("loadingError") || "Данные загружаются, пожалуйста, обновите страницу"}
					</p>
				</div>
			)}

			{data && data.length > 0 && visibleCount < data.length && (
				<div className="px-0 md:px-[20px]">
					<a href={`?count=${visibleCount + 3}`}>
						<ButtonGreenBorder
							width="100%"
							text={mfo("showMore")}
							className="mt-[20px] mb-[30px]"
						/>
					</a>
				</div>
			)}

			<DetailsText html={getAllSettings?.settings.mfo_page_text} />
			{faqs && faqs.length > 0 ? (
				<OftenQuestions faqs={faqs} />
			) : (
				<OftenQuestions />
			)}
			<InfoHelpful randomAuthor={randomAuthor} locale={locale} />
			<Questions />
			<div className="px-0 md:px-[20px]">
				<p
					className="font-medium text-[13px] mt-[50px] leading-[138%] text-[#67677a]"
					aria-label="Дата додавання"
				>
					{dates.date_published
						? mfo("dateAdded") +
						  new Date(dates.date_published).toLocaleDateString(
								"ru-RU",
								{
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								}
						  )
						: mfo("dateAdded")}
				</p>
				<p
					className="font-medium text-[13px] leading-[138%] text-[#67677a]"
					aria-label="Дата оновлення"
				>
					{dates.date_modified && dates.date_modified !== dates.date_published
						? mfo("dateUpdated") +
						  new Date(dates.date_modified).toLocaleDateString(
								"ru-RU",
								{
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								}
						  )
						: mfo("dateUpdated") +
						  new Date().toLocaleDateString("ru-RU", {
								day: "2-digit",
								month: "2-digit",
								year: "numeric",
						  })}
				</p>
			</div>
		</>
	);
}
