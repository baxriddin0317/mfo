// app/[lang]/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";
import FinancialMarketplace from "../components/Home/FinancialMarketplace";
import BestLoans from "../components/Home/BestLoans";
import { getTranslations } from "next-intl/server";
import { getHomeData, LangType } from "../services/HomeService";
import settingsService from "../services/settingsService";
import { generateAlternates } from "../lib/metadataUtils";

// Lazy load heavy components for better initial load performance
const TopUkrMFO = dynamic(() => import("../components/Home/TopUkrMFO").then(mod => ({ default: mod.TopUkrMFO })), {
	loading: () => <div className="h-[400px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const LastReviews = dynamic(() => import("../components/Home/LastRewiews").then(mod => ({ default: mod.LastReviews })), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const DetailsText = dynamic(() => import("../components/DetailsText"), {
	loading: () => <div className="h-[200px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

const Questions = dynamic(() => import("../components/Home/Questions"), {
	loading: () => <div className="h-[300px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;

	const getAllSettingsMeta = await settingsService.getSettingsByGroup(
		"seo",
		lang === "ua" ? "uk" : "ru"
	);
	const t = await getTranslations({ locale: lang, namespace: "Metadata" });

	const alternates = generateAlternates([], lang);
	const ogTitle = t("home.title");
	const ogDescription = t("home.description");

	return {
		title:
			getAllSettingsMeta.settings.main_page_meta_title || ogTitle,
		description:
			getAllSettingsMeta.settings.main_page_meta_description ||
			ogDescription,
		alternates,
		openGraph: {
			title: ogTitle,
			description: ogDescription,
			url: alternates.canonical,
			siteName: "MFoxa",
			images: [
				{
					url: "https://mfoxa.com.ua/og-main.jpg",
					width: 1200,
					height: 630,
					alt: ogTitle,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: ogTitle,
			description: ogDescription,
			images: ["https://mfoxa.com.ua/og-main.jpg"],
		},
	};
}

export default async function Home({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;

	const homeData = await getHomeData(lang as LangType);
	let getAllSettings;

	try {
		getAllSettings = await settingsService.getSettingsByGroup(
			"seo",
			lang === "ua" ? "uk" : "ru"
		);
	} catch (error) {
		console.error("Ошибка при получении настроек:", error);
	}
	return (
		<div>
			<FinancialMarketplace
				locale={lang}
				settings={getAllSettings?.settings}
			/>
			<BestLoans best_credits={homeData.best_credits} />
			<TopUkrMFO top_mfos={homeData.top_mfos} />
			<LastReviews recent_reviews={homeData.recent_reviews} />
			<DetailsText html={getAllSettings?.settings.main_page_text} />
			<Questions />
		</div>
	);
}
