import { Metadata } from "next";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { catalogService } from "@/app/services/catalogService";
import { LoanStructuredData } from "@/app/structured-data/LoanStructuredData";
import authorsService from "@/app/services/authorsService";
import { FaqsService } from "@/app/services/FaqService";
import settingsService from "@/app/services/settingsService";
import { getHomeData, LangType } from "@/app/services/HomeService";
import { getPageDates } from "@/app/services/PageDatesService";
import { generateAlternates } from "@/app/lib/metadataUtils";
import { getMFOs } from "@/app/services/mfosService";
import { MfoDetails } from "@/app/services/getMfoDetailsService";
import axios from "axios";

// Lazy load heavy components for better initial load performance
const LoanClientPage = dynamic(() => import("@/app/components/LoanClientPage"), {
	loading: () => <div className="h-[400px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	
	let res;
	try {
		res = await catalogService.getAll({
			lang: lang === "ua" ? "uk" : "ru",
			type: "loan",
		});

		// Check if data exists and has at least one item
		if (!res.data || res.data.length === 0) {
			notFound();
		}
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 404) {
			notFound();
		}
		throw error;
	}

	const alternates = generateAlternates(["loan"], lang);

	return {
		title: res.data[0].meta_title,
		description: res.data[0].meta_description,
		alternates,
		openGraph: {
			title: res.data[0].meta_title,
			description: res.data[0].meta_description,
			url: alternates.canonical,
			siteName: "MFoxa",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: res.data[0].meta_title,
			description: res.data[0].meta_description,
		},
	};
}

type LoanPageProps = {
	params: Promise<{ lang: string }>;
	searchParams: Promise<{ count?: string }>;
};

export default async function LoanPageWrapper({
	params,
	searchParams,
}: LoanPageProps) {
	const { lang } = await params;
	const { count } = await searchParams;
	const visibleCount = count ? parseInt(count, 10) : 6;

	// Parallel загрузка данных для оптимизации производительности
	const langParam = lang === "ua" ? "uk" : "ru";
	
	// Загружаем все данные параллельно для ускорения
	const [dataResult, dataBySlugResult, randomAuthorResult, faqsResult, datesResult, getAllSettingsResult, homeDataResult, mfosResult] = await Promise.allSettled([
		catalogService.getAll({
			lang: langParam,
			type: "loan",
		}),
		catalogService.getBySlug({
			slug: "loan",
			lang: langParam,
			isLoan: false,
		}),
		authorsService.getRandomAuthor(langParam),
		FaqsService.getFaqs({
			page_name: "loan",
			lang: langParam,
		}),
		getPageDates({ type: "loans" }),
		settingsService.getSettingsByGroup("loan_page", langParam),
		getHomeData(lang as LangType),
		getMFOs({
			lang: langParam,
			sort: "rating",
		}),
	]);

	// Обработка результатов с fallback значениями
	let data;
	if (dataResult.status === "fulfilled") {
		data = dataResult.value;
		// Additional validation
		if (!data || !data.data || data.data.length === 0) {
			notFound();
		}
	} else {
		if (axios.isAxiosError(dataResult.reason) && dataResult.reason.response?.status === 404) {
			notFound();
		}
		throw dataResult.reason;
	}

	let dataBySlug;
	if (dataBySlugResult.status === "fulfilled") {
		dataBySlug = dataBySlugResult.value;
	} else {
		if (axios.isAxiosError(dataBySlugResult.reason) && dataBySlugResult.reason.response?.status === 404) {
		notFound();
	}
		throw dataBySlugResult.reason;
	}

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

	const faqs = faqsResult.status === "fulfilled" ? faqsResult.value : [];
	
	const dates = datesResult.status === "fulfilled" 
		? datesResult.value 
		: { 
			date_published: new Date().toISOString(), 
			date_modified: new Date().toISOString(),
			type: "loans"
		};

	let getAllSettings;
	if (getAllSettingsResult.status === "fulfilled") {
		getAllSettings = getAllSettingsResult.value;
	} else {
		console.error("Ошибка при получении настроек:", getAllSettingsResult.reason);
		getAllSettings = undefined;
	}

	const homeData = homeDataResult.status === "fulfilled" 
		? homeDataResult.value 
		: undefined;

	// Загружаем MFO данные на сервере для structured data
	let mfos: MfoDetails[] = [];
	if (mfosResult.status === "fulfilled") {
		mfos = mfosResult.value;
	} else {
		console.error("Ошибка при загрузке MFO для structured data:", mfosResult.reason);
		// Продолжаем работу даже если не удалось загрузить MFO
	}

	return (
		<>
			<LoanStructuredData
				lang={lang as "ru" | "ua"}
				dates={dates}
				getAllSettings={getAllSettings}
				mfos={mfos}
			/>
			<LoanClientPage
				homeData={homeData}
				faqs={faqs}
				getAllSettings={getAllSettings}
				data={data}
				dataBySlug={dataBySlug}
				randomAuthor={randomAuthor}
				visibleCount={visibleCount}
				locale={lang}
			/>
		</>
	);
}
