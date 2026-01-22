// app/[lang]/sitemap/page.tsx

import sitemapService, { SitemapEntry } from "@/app/services/sitemapService";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import settingsService from "@/app/services/settingsService";
import { getPageDates } from "@/app/services/PageDatesService";
import { Metadata } from "next";
import { generateAlternates } from "@/app/lib/metadataUtils";

type Props = {
	params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { lang } = await params;
	const t = await getTranslations({ locale: lang, namespace: "Sitemap" });
	
	const alternates = generateAlternates(["sitemap"], lang);

	return {
		title: t("title"),
		alternates,
	};
}

export default async function SitemapPage({ params }: Props) {
	const { lang } = await params;

	const t = await getTranslations({
		locale: lang === "ua" ? "ru" : "ua",
		namespace: "Sitemap",
	});
	const sitemap = await sitemapService.getSitemap(
		lang === "ua" ? "uk" : "ru"
	);

	const alphabet = Object.keys(sitemap.categories).sort((a, b) =>
		a.localeCompare(b, lang)
	);
	let getAllSettings;

	try {
		getAllSettings = await settingsService.getSettingsByGroup(
			"sitemap_page",
			lang === "ua" ? "uk" : "ru"
		);
	} catch (error) {
		console.error("Ошибка при получении настроек:", error);
	}
	const dates = await getPageDates({ type: "sitemap" });

	return (
		<main className="px-4 md:px-20 py-10">
			<h1 className="text-black text-3xl md:text-5xl font-bold mb-6 text-center">
				{getAllSettings?.settings.main_page_title || t("title")}
			</h1>
			{alphabet.map((letter) => (
				<div key={letter} className="mb-8">
					<h2 className="text-xl text-black font-semibold mb-4">
						{letter}
					</h2>
					<ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{sitemap.categories[letter].map(
							(item: SitemapEntry, index) => (
								<li
									key={index}
									className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
								>
									<Link
										href={item.url}
										className="text-[#724dea] hover:underline"
									>
										<h3 className="font-bold text-lg">
											{item.title}
										</h3>
									</Link>
									<p className="text-sm text-gray-600">
										{item.description}
									</p>
								</li>
							)
						)}
					</ul>
				</div>
			))}

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
					{dates?.date_modified
						? t("metadata.updatedDate") +
						  " " +
						  new Date(dates?.date_modified).toLocaleDateString(
								"ru-RU",
								{
									day: "2-digit",
									month: "2-digit",
									year: "numeric",
								}
						  )
						: t("metadata.updatedDate")}
				</p>
			</div>
		</main>
	);
}
