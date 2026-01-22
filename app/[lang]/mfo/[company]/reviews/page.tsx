import CompanyRewiwsClient from "@/app/components/CompanyRewiwsClient";
import { getMfoDetails } from "@/app/services/getMfoDetailsService";
import { getPageDates } from "@/app/services/PageDatesService";
import { getReviews, getReviewStatistics } from "@/app/services/reviewService";
import { Metadata } from "next";
import { generateAlternates } from "@/app/lib/metadataUtils";

interface Props {
	params: Promise<{ company: string; lang: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { company, lang } = await params;
	const slug = decodeURIComponent(company || "sgroshi");

	// Fetch MFO details to get specific reviews metadata
	let title: string;
	let description: string;

	try {
		const { data } = await getMfoDetails(
			slug,
			lang === "ua" ? "uk" : "ru"
		);

		// Use specific reviews metadata if available
		title = data.reviews_meta_title || data.meta_title || `Відгуки ${data.name}`;
		description = data.reviews_meta_description || data.meta_description || `Відгуки про ${data.name}`;
	} catch (error) {
		console.error("Ошибка при получении данных MFO:", error);
		// Fallback to template-based metadata if API fails
		const companyName = slug
			.replace(/-/g, " ")
			.replace(/\b\w/g, (c) => c.toUpperCase());

		let messages;
		try {
			messages = (await import(`@/app/messages/${lang}.json`)).default;
		} catch {
			messages = (await import(`@/app/messages/ru.json`)).default;
		}

		const template = messages?.Metadata?.reviews || {
			title: "Отзывы {company}",
			description: "Отзывы о {company}",
		};

		title = template.title.replace("{company}", companyName);
		description = template.description.replace("{company}", companyName);
	}

	const alternates = generateAlternates(["mfo", slug, "reviews"], lang);

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
			images: [`https://mfoxa.com.ua/og-${slug}-reviews.jpg`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`https://mfoxa.com.ua/og-${slug}-reviews.jpg`],
		},
	};
}

export default async function CompanyReviewsPage({ params }: Props) {
	const { company, lang } = await params;
	const companySlug = decodeURIComponent(company || "sgroshi");
	const { data } = await getMfoDetails(
		companySlug,
		lang === "ua" ? "uk" : "ru"
	);
	const dates = companySlug
		? await getPageDates({ type: "reviews", mfo_slug: companySlug })
		: null;

	const reviewsData = await getReviews({
		mfo_slug: companySlug,
		sort: "newest",
	});

	const stats = await getReviewStatistics();

	console.log("data", data);

	return (
		<CompanyRewiwsClient
			lang={lang}
			mfoData={data}
			slug={companySlug}
			dates={dates}
			initialReviews={reviewsData}
			stats={stats}
		/>
	);
}
