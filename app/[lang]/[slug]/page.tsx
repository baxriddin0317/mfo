import dynamic from "next/dynamic";
import authorsService from "@/app/services/authorsService";
import { catalogService } from "@/app/services/catalogService";
import { getPageDates } from "@/app/services/PageDatesService";
import settingsService from "@/app/services/settingsService";
import { getHomeData, LangType } from "@/app/services/HomeService";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import axios from "axios";
import { BezotkazaStructuredData } from "@/app/structured-data/BezotkazaStructuredData";
import { generateAlternates } from "@/app/lib/metadataUtils";
import { LoanSlugStructuredData } from "@/app/structured-data/LoanSlugStructuredData";

// Lazy load heavy components for better initial load performance
const CreditClientPage = dynamic(() => import("@/app/components/CreditClientPage"), {
	ssr: true,
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
	const { lang, slug } = await params;
	
	let res;
	try {
		res = await catalogService.getBySlug({
			slug,
			lang: lang === "ua" ? "uk" : "ru",
			isLoan: false,
		});
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			notFound();
		}
		throw error;
	}

	const alternates = generateAlternates([slug], lang);

	return {
		title: res.page.meta_title,
		description: res.page.meta_description,
		alternates,
		openGraph: {
			title: res.page.meta_title,
			description: res.page.meta_description,
			url: alternates.canonical,
			siteName: "MFoxa",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: res.page.meta_title,
			description: res.page.meta_description,
		},
	};
}
type LoanDescriptionProps = {
	params: Promise<{ lang: string; slug: string }>;
	searchParams: Promise<{ count?: string }>;
};
export default async function LoanDescription({
	params,
	searchParams,
}: LoanDescriptionProps) {
	const { lang, slug } = await params;
	const { count } = await searchParams;
	const visibleCount = count ? parseInt(count, 10) : 6;

	// Parallel загрузка данных для оптимизации производительности
	const langParam = lang === "ua" ? "uk" : "ru";
	
	// Загружаем все данные параллельно для ускорения
	const [dataResult, resResult, datesResult, randomAuthorResult, homeDataResult, getAllSettingsResult] = await Promise.allSettled([
		catalogService.getAll({
			lang: langParam,
			type: "credit",
		}),
		catalogService.getBySlug({
			slug,
			lang: langParam,
			isLoan: false,
		}),
		getPageDates({ type: "loans" }),
		authorsService.getRandomAuthor(langParam),
		getHomeData(lang as LangType),
		settingsService.getSettingsByGroup("loan_page", langParam),
	]);

	// Обработка результатов с fallback значениями
	let data: import("@/app/services/catalogService").GetCatalogListResponse;
	if (dataResult.status === "fulfilled") {
		data = dataResult.value;
	} else {
		console.error("Ошибка при загрузке каталога:", dataResult.reason);
		data = { data: [], message: "" };
	}

	let res;
	if (resResult.status === "fulfilled") {
		res = resResult.value;
	} else {
		if (axios.isAxiosError(resResult.reason) && resResult.reason.response?.status === 404) {
			notFound();
		}
		throw resResult.reason;
	}

	const dates = datesResult.status === "fulfilled" 
		? datesResult.value 
		: { 
			date_published: new Date().toISOString(), 
			date_modified: new Date().toISOString(),
			type: "loans"
		};

	const randomAuthor = randomAuthorResult.status === "fulfilled" 
		? randomAuthorResult.value 
		: {
			data: {
				id: 0,
				name: "",
				education: "",
				work_experience: "",
				additional_qualification: "",
				avatar: "/photo.svg",
			},
			meta: {
				language: langParam as "uk" | "ru",
				total_authors: 0,
				generated_at: new Date().toISOString(),
			}
		} as import("@/app/services/authorsService").AuthorRandomResponse;

	const homeData = homeDataResult.status === "fulfilled" 
		? homeDataResult.value 
		: undefined;

	let getAllSettings;
	if (getAllSettingsResult.status === "fulfilled") {
		getAllSettings = getAllSettingsResult.value;
	} else {
		console.error("Ошибка при получении настроек:", getAllSettingsResult.reason);
		getAllSettings = undefined;
	}

	return (
		<>
			<BezotkazaStructuredData
				lang={lang as LangType}
				dates={dates}
				page={res.page}
			/>
			<LoanSlugStructuredData
				pageTitle={res.page.meta_title}
				pageUrl={`https://mfoxa.com.ua${
					lang === "ru" ? "/ru" : ""
				}/loan/${slug}`}
				loans={data.data.map((item) => ({
					name: item.button_name,
					url: `https://mfoxa.com.ua${
						lang === "ru" ? "/ru" : ""
					}/loan/${item.slug}`,
					legal_name: item.meta_title,
					license: undefined,
					apr_min: 0,
					apr_max: 1,
					rating_value: 5,
					review_count: 0,
					offers: [
						{
							name: "Первый кредит",
							url: `https://mfoxa.com.ua/apply?type=first&loan=${item.slug}`,
							amount_min: 0,
							amount_max: 5000,
							term_min: 1,
							term_max: 30,
							interestRate: 0,
						},
						{
							name: "Повторный кредит",
							url: `https://mfoxa.com.ua/apply?type=repeat&loan=${item.slug}`,
							amount_min: 0,
							amount_max: 30000,
							term_min: 1,
							term_max: 30,
							interestRate: 0.01,
						},
					],
				}))}
			/>
			<CreditClientPage
				page={res.page}
				getAllSettings={getAllSettings}
				randomAuthor={randomAuthor}
				faqs={res.page.faqs}
				dates={dates}
				data={data}
				slug={slug}
				visibleCount={visibleCount}
				locale={lang}
				homeData={homeData}
			/>
		</>
	);
}
