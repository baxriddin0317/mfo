// app/[lang]/mfo/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { getPageDates, PageDatesResponse } from "@/app/services/PageDatesService";
import { getMFOs } from "@/app/services/mfosService";
import authorsService, { AuthorRandomResponse } from "@/app/services/authorsService";
import { FaqsService } from "@/app/services/FaqService";
import settingsService from "@/app/services/settingsService";
import { MfoPageStructuredData } from "@/app/structured-data/MfoPageStructuredData";
import { generateAlternates } from "@/app/lib/metadataUtils";

// Lazy load heavy components for better initial load performance
const MfoPageClient = dynamic(() => import("../../components/MfoPageClient"), {
	loading: () => <div className="h-[400px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const t = await getTranslations({ locale: lang, namespace: "Metadata" });
	let getAllSettings;

	try {
		getAllSettings = await settingsService.getSettingsByGroup(
			"mfo_page",
			lang === "ua" ? "uk" : "ru"
		);
	} catch (error) {
		console.error("Ошибка при получении настроек:", error);
	}

	const alternates = generateAlternates(["mfo"], lang);

	const ogTitle = getAllSettings?.settings.mfo_page_meta_title || t("home.title");
	const ogDescription = getAllSettings?.settings.mfo_page_meta_description || t("home.description");

	return {
		title: ogTitle,
		description: ogDescription,
		alternates,
		openGraph: {
			title: ogTitle,
			description: ogDescription,
			url: alternates.canonical,
			siteName: "MFoxa",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title: ogTitle,
			description: ogDescription,
		},
	};
}

export default async function MfoPage({
	params,
	searchParams,
}: {
	params: Promise<{ lang: string }>;
	searchParams: Promise<{ count?: string }>;
}) {
	const { lang } = await params;
	const { count } = await searchParams;
	const visibleCount = count ? parseInt(count, 10) : 10;

	// Получение переводов
	const mfoT = await getTranslations({ locale: lang, namespace: "MfoPage" });
	const ratingsT = await getTranslations({
		locale: lang,
		namespace: "RatingDisplay",
	});

	// Определение мобильного устройства
	const headersList = await headers();
	const userAgent = headersList.get("user-agent") || "";
	const parser = new UAParser(userAgent);
	const isMobile = parser.getDevice().type === "mobile";

	// Parallel загрузка данных для оптимизации производительности
	const langParam = lang === "ua" ? "uk" : "ru";
	
	// Загружаем все данные параллельно для ускорения
	const [dates, dataResult, randomAuthor, faqs, getAllSettingsResult] = await Promise.allSettled([
		getPageDates({ type: "mfo" }),
		getMFOs({ lang: langParam }),
		authorsService.getRandomAuthor(langParam),
		FaqsService.getFaqs({
			page_name: "mfo",
			lang: langParam,
		}),
		settingsService.getSettingsByGroup("mfo_page", langParam),
	]);

	// Обработка результатов с fallback значениями
	const datesData: PageDatesResponse = dates.status === "fulfilled" 
		? dates.value 
		: { 
			date_published: new Date().toISOString(), 
			date_modified: new Date().toISOString(),
			type: "mfo"
		};
	
	let data: Awaited<ReturnType<typeof getMFOs>> = [];
	if (dataResult.status === "fulfilled") {
		data = dataResult.value;
	} else {
		console.error("Ошибка при загрузке МФО:", dataResult.reason);
		// Продолжаем работу с пустым массивом, чтобы не показывать пустой экран
		data = [];
	}

	// Fallback для randomAuthor - создаем минимальный объект
	const randomAuthorData = randomAuthor.status === "fulfilled" 
		? randomAuthor.value 
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
		} as AuthorRandomResponse;
	
	const faqsData = faqs.status === "fulfilled" ? faqs.value : [];
	const getAllSettings = getAllSettingsResult.status === "fulfilled" ? getAllSettingsResult.value : undefined;

	return (
		<>
			<MfoPageStructuredData
				lang={lang as "ru" | "ua"}
				data={data}
				dates={datesData}
				getAllSettings={getAllSettings}
			/>
			<MfoPageClient
				randomAuthor={randomAuthorData}
				getAllSettings={getAllSettings}
				faqs={faqsData}
				dates={datesData}
				data={data}
				translations={{ mfo: mfoT, ratings: ratingsT }}
				visibleCount={visibleCount}
				isMobile={isMobile}
				locale={lang}
			/>
		</>
	);
}
