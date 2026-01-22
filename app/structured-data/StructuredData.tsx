"use client";

import { usePathname } from "next/navigation";

import { LangType } from "../services/HomeService";
import { addressByLang } from "./defaults";
import { useEffect } from "react";

export default function StructuredData({ lang }: { lang: LangType }) {
	const pathname = usePathname();

	// 1. Organization
	const organization = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "MFoxa",
		url: "https://mfoxa.com.ua",
		description: {
			ru: "Маркетплейс микрофинансовых организаций Украины",
			ua: "Маркетплейс мікрофінансових організацій України",
		}[lang],
		logo: "https://mfoxa.com.ua/logo.png",
		foundingDate: "2013",
		address: {
			"@type": "PostalAddress",
			addressCountry: "UA",
			postalCode: "61174",
			...addressByLang[lang],
		},
		contactPoint: [
			{
				"@type": "ContactPoint",
				telephone: "+380930000000",
				email: "admin@mfoxa.com.ua",
				contactType: "customer support",
				areaServed: "UA",
				availableLanguage: ["Russian", "Ukrainian"],
			},
		],
		hasCredential: {
			"@type": "EducationalOccupationalCredential",
			credentialCategory: "License",
			name: "Лицензия НБУ",
		},
	};

	// 2. WebSite
	const website = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: "MFoxa",
		url: "https://mfoxa.com.ua",
		description:
			lang === "ua"
				? "Фінансовий маркетплейс для порівняння МФО в Україні."
				: "Финансовый маркетплейс для сравнения МФО в Украине.",

		inLanguage: ["ru", "uk"],
		publisher: {
			"@type": "Organization",
			name: "MFoxa",
			logo: {
				"@type": "ImageObject",
				url: "https://mfoxa.com.ua/logo.png",
			},
		},
		potentialAction: {
			"@type": "SearchAction",
			target: "https://mfoxa.com.ua/search?q={search_term_string}",
			"query-input": "required name=search_term_string",
		},
	};

	// 3. BreadcrumbList (строим по pathname)
	const segments = pathname.split("/").filter(Boolean);
	const filteredSegments = segments.filter(
		(seg) => seg !== "ru" && seg !== "ua"
	);

	const breadcrumbs = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: lang === "ua" ? "Головна" : "Главная",
				item: "https://mfoxa.com.ua",
			},
			...filteredSegments.map((seg, idx) => ({
				"@type": "ListItem",
				position: idx + 2,
				name: decodeURIComponent(seg), // TODO: лучше заменить на словарь slug → title
				item: `https://mfoxa.com.ua/${filteredSegments
					.slice(0, idx + 1)
					.join("/")}`,
			})),
		],
	};

	const schemas = [organization, website, breadcrumbs];

	useEffect(() => {
		const seen = new Set<string>();

		document
			.querySelectorAll<HTMLScriptElement>(
				'script[id^="structured-data"]'
			)
			.forEach((el) => {
				const content = el.innerHTML.trim();
				if (seen.has(content)) {
					el.remove();
				} else {
					seen.add(content);
				}
			});
	}, []);

	return (
		<>
			{schemas.map((schema, i) => (
				<script
					id={`structured-data-${i}`}
					key={i}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
				/>
			))}
		</>
	);
}
