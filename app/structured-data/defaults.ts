import { LangType } from "../services/HomeService";

export const calculateWilsonRating = (
	rating: number,
	count: number
): number => {
	if (count === 0) return rating;

	const z = 1.96;
	const p = rating / 5;
	const n = count;

	const numerator =
		p +
		(z * z) / (2 * n) -
		z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
	const denominator = 1 + (z * z) / n;

	return Math.max(0, Math.min(5, (numerator / denominator) * 5));
};

export const knowsAboutByLang = {
	ru: ["Микрофинансирование", "Финансовые услуги", "Кредитование"],
	ua: ["Мікрофінансування", "Фінансові послуги", "Кредитування"],
};

export const addressByLang = {
	ru: {
		addressRegion: "Харьковская обл.",
		streetAddress: "Архитекторов 32",
		addressLocality: "Харьков",
	},
	ua: {
		addressRegion: "Харківська обл.",
		streetAddress: "Архітекторів 32",
		addressLocality: "Харків",
	},
};

export const emptyAddress = {
	"@type": "PostalAddress",
	streetAddress: "—",
	addressLocality: "—",
	addressRegion: "—",
	postalCode: "—",
	addressCountry: "UA",
};

export const getDefaultWebPageSchema = ({
	lang,
	title,
	description,
	path,
	dates,
}: {
	lang: LangType;
	title: string;
	description: string;
	path: string;
	dates: { date_published: string; date_modified: string };
}) => ({
	"@context": "https://schema.org",
	"@type": "WebPage",
	name: title,
	description,
	url: `https://mfoxa.com.ua${lang === "ru" ? "/ru" : ""}${path}`,
	datePublished: dates.date_published,
	dateModified: dates.date_modified,
	inLanguage: lang === "ua" ? "uk-UA" : "ru-UA",
	isPartOf: {
		"@type": "WebSite",
		url: "https://mfoxa.com.ua",
	},
	publisher: {
		"@type": "Organization",
		name: "MFoxa",
		url: "https://mfoxa.com.ua",
		logo: {
			"@type": "ImageObject",
			url: "https://mfoxa.com.ua/logo.png",
		},
	},
});
