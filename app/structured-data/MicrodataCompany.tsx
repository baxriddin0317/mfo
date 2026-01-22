import { MfoDetails } from "@/app/services/getMfoDetailsService";
import { PageDatesResponse } from "@/app/services/PageDatesService";
import { LangType } from "../services/HomeService";
import { getDefaultWebPageSchema } from "./defaults";
import { getExtremeValuesByKey } from "../lib/utils";

type MicrodataCompanyProps = {
	company: string;
	data: MfoDetails;
	dates?: PageDatesResponse | null;
	lang: LangType;
};

const texts = {
	ru: {
		defaultTitle: "Информация о МФО",
		defaultCompany: "Название компании",
		webDescription: (name: string) => `Условия займов и отзывы о ${name}`,
		orgDescription: (name: string) =>
			`Микрофинансовая организация ${name} - условия займов, отзывы клиентов`,
		loanName: (name: string) => `Займ в ${name}`,
		loanDescription: (name: string) =>
			`Условия получения займа в микрофинансовой организации ${name}`,
		tariffs: (name: string) => `Тарифы ${name}`,
		tariff: (i: number) => `Тариф ${i + 1}`,
	},
	ua: {
		defaultTitle: "Інформація про МФО",
		defaultCompany: "Назва компанії",
		webDescription: (name: string) => `Умови позик та відгуки про ${name}`,
		orgDescription: (name: string) =>
			`Мікрофінансова організація ${name} - умови позик, відгуки клієнтів`,
		loanName: (name: string) => `Позика в ${name}`,
		loanDescription: (name: string) =>
			`Умови отримання позики в мікрофінансовій організації ${name}`,
		tariffs: (name: string) => `Тарифи ${name}`,
		tariff: (i: number) => `Тариф ${i + 1}`,
	},
};

export const MicrodataCompany = ({
	company,
	data,
	dates,
	lang,
}: MicrodataCompanyProps) => {
	const t = texts[lang];

	const dateModified = dates?.date_modified || data.updated_at || new Date().toISOString();
	const datePublished = dates?.date_published || data.created_at || new Date().toISOString();

	const webPageSchemaRaw = getDefaultWebPageSchema({
		lang,
		dates: {
			date_modified: dateModified,
			date_published: datePublished,
		},
		title: data.name || t.defaultTitle,
		description: t.webDescription(data.name),
		path: `/mfo/${company}`,
	});
	
	
	const { "@context": _context, ...webPageSchema } = webPageSchemaRaw;
	void _context;

	const organizationId = `https://mfoxa.com.ua/${lang === "ua" ? "" : "ru/"}mfo/${company}#organization`;
	
	const organizationSchema = {
		"@type": "FinancialService",
		"@id": organizationId,
		name: data.name || t.defaultCompany,
		alternateName: data.legal_entity,
		url: data.redirect_url || data.official_website,
		logo: data.logo_url,
		description: t.orgDescription(data.name),
		identifier: data.nbu_license,
		contactPoint: {
			"@type": "ContactPoint",
			telephone: data.phone,
			email: data.email,
			contactType: "customer service",
			areaServed: "UA",
			availableLanguage: ["Ukrainian", "Russian"],
		},
		priceRange: "$$",
		image: `https://mfoxa.com.ua/logo.png`,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: Number(data?.rating_average) || 5,
			bestRating: 5,
			worstRating: 1,
			ratingCount: Number(data?.rating_count) || 1,
		},
		hasOfferCatalog: {
			"@type": "OfferCatalog",
			name: t.tariffs(data.name),
			itemListElement:
				data.tariffs?.map((tariff, index: number) => ({
					"@type": "Offer",
					name: tariff.name || t.tariff(index),
					price: tariff.max_amount,
					priceCurrency: "UAH",
					availability: "https://schema.org/InStock",
				})) || [],
		},
	};

	const loanSchema = {
		"@type": "LoanOrCredit",
		name: t.loanName(data.name),
		description: t.loanDescription(data.name),
		provider: {
			"@id": organizationId,
		},
		loanTerm: {
			"@type": "QuantitativeValue",
			minValue:
				getExtremeValuesByKey(data.tariffs, "min_term_days").min || 1,
			maxValue:
				getExtremeValuesByKey(data.tariffs, "max_term_days").max || 30,
			unitText: "DAY",
		},
		amount: {
			"@type": "MonetaryAmount",
			minValue:
				getExtremeValuesByKey(data.tariffs, "min_amount").min || 1,
			maxValue:
				getExtremeValuesByKey(data.tariffs, "max_amount").max || 999999,
			currency: "UAH",
		},
		interestRate: {
			"@type": "QuantitativeValue",
			minValue: getExtremeValuesByKey(data.tariffs, "rate").min || 1,
			maxValue: getExtremeValuesByKey(data.tariffs, "rate").max || 999,
			unitText: "PERCENT",
		},
	};

	const allSchemas = {
		"@context": "https://schema.org",
		"@graph": [
			webPageSchema,
			organizationSchema,
			loanSchema,
		],
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(allSchemas),
			}}
		/>
	);
};
