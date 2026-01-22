import { PageDatesResponse } from "@/app/services/PageDatesService";
import { SettingsGroupResponse } from "@/app/services/settingsService";
import { addressByLang, getDefaultWebPageSchema } from "./defaults";

type ContactStructuredDataProps = {
	lang: "ru" | "ua";
	dates: PageDatesResponse;
	getAllSettings: SettingsGroupResponse | undefined;
};

export const ContactStructuredData = ({
	lang,
	dates,
	getAllSettings,
}: ContactStructuredDataProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang,
		title:
			getAllSettings?.settings.contacts_page_title ||
			(lang === "ua" ? "Контакти MFoxa" : "Контакты MFoxa"),
		description:
			getAllSettings?.settings.contacts_page_description ||
			(lang === "ua"
				? "Контактна інформація фінансового маркетплейсу MFoxa"
				: "Контактная информация финансового маркетплейса MFoxa"),
		path: "/contacts",
		dates,
	});

	const localBusinessSchema = {
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		name:
			lang === "ua"
				? "MFoxa – Фінансовий маркетплейс"
				: "MFoxa – Финансовый маркетплейс",
		description:
			lang === "ua"
				? "Офіс фінансового маркетплейсу MFoxa у Харкові"
				: "Офис финансового маркетплейса MFoxa в Харькове",
		url: "https://mfoxa.com.ua",
		telephone: "+380930000000",
		email: "admin@mfoxa.com.ua",
		image: "https://mfoxa.com.ua/logo.png",
		address: {
			"@type": "PostalAddress",
			postalCode: "61174",
			addressCountry: "UA",
			...addressByLang[lang],
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: "49.9935",
			longitude: "36.2304",
		},
		openingHours: ["Mo-Fr 09:00-18:00"],
		priceRange: "$$",
	};

	const allSchemas = [webPageSchema, localBusinessSchema];

	return (
		<>
			{allSchemas.map((schema, index) => (
				<script
					key={index}
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schema),
					}}
				/>
			))}
		</>
	);
};
