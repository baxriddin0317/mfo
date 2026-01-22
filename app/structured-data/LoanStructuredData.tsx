import { PageDatesResponse } from "@/app/services/PageDatesService";
import { SettingsGroupResponse } from "@/app/services/settingsService";
import { getDefaultWebPageSchema } from "./defaults";
import { MfoDetails } from "@/app/services/getMfoDetailsService";

type LoanStructuredDataProps = {
	lang: "ru" | "ua";
	dates: PageDatesResponse;
	getAllSettings: SettingsGroupResponse | undefined;
	mfos?: MfoDetails[];
};

export const LoanStructuredData = ({
	lang,
	dates,
	getAllSettings,
	mfos = [],
}: LoanStructuredDataProps) => {
	const webPageSchema = getDefaultWebPageSchema({
		lang,
		title:
			getAllSettings?.settings.loan_page_title ||
			(lang === "ua"
				? "Позики онлайн - МФО України"
				: "Займы онлайн - МФО Украины"),
		description:
			getAllSettings?.settings.loan_page_description ||
			(lang === "ua"
				? "Отримайте позику онлайн від перевірених МФО України. Швидке схвалення, вигідні умови, мінімальні вимоги."
				: "Получите займ онлайн от проверенных МФО Украины. Быстрое одобрение, выгодные условия, минимальные требования."),
		path: "/loan",
		dates,
	});

	const allSchemas: object[] = [webPageSchema];

	// Добавляем ItemList только если есть элементы
	if (mfos.length > 0) {
		const filteredMFOs = mfos.filter((mfo) => mfo.name?.trim());
		const itemListElements = filteredMFOs.map((mfo, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "FinancialService",
				name: mfo.name.trim(),
				url:
					mfo.redirect_url ||
					mfo.official_website ||
					`https://mfoxa.com.ua${lang === "ua" ? "" : "/ru"}/mfo/${mfo.slug}`,
				logo: mfo.logo_url,
				mainEntityOfPage: `https://mfoxa.com.ua${lang === "ua" ? "" : "/ru"}/loan`,
				image: mfo.logo_url,
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: Number(mfo?.rating_average) || 5,
					bestRating: 5,
					worstRating: 1,
					ratingCount: Number(mfo?.rating_count) || 1,
				},
				provider: {
					"@type": "Organization",
					name: mfo.legal_entity || mfo.name,
					...(mfo.nbu_license
						? {
								additionalProperty: {
									"@type": "PropertyValue",
									name: "Лицензия НБУ",
									value: mfo.nbu_license,
								},
						  }
						: {}),
				},
				makesOffer: mfo.catalog_offers?.map((offer) => ({
					"@type": "Offer",
					name:
						offer.client_type === "new"
							? "Первый кредит"
							: offer.client_type === "repeat"
							? "Повторный кредит"
							: "Кредит",
					url: mfo.get_money_button_url,
					itemOffered: {
						"@type": "LoanOrCredit",
						name: mfo.name,
						amount: {
							"@type": "MonetaryAmount",
							currency: "UAH",
							minValue: +offer.amount_from,
							maxValue: +offer.amount_to,
						},
						loanTerm: {
							"@type": "QuantitativeValue",
							unitText: "DAY",
							minValue: offer.term_from,
							maxValue: offer.term_to,
						},
						interestRate: offer.rate,
						annualPercentageRate: {
							"@type": "QuantitativeValue",
							unitText: "PERCENT",
							minValue: offer.real_annual_rate_from,
							maxValue: offer.real_annual_rate_to,
						},
					},
				})),
				priceRange: "$$",
			},
		}));

		const itemListSchema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name:
				getAllSettings?.settings.loan_page_title ||
				(lang === "ua" ? "Позики онлайн" : "Займы онлайн"),
			description:
				getAllSettings?.settings.loan_page_description ||
				(lang === "ua"
					? "Список перевірених МФО України"
					: "Список проверенных МФО Украины"),
			itemListOrder: "https://schema.org/ItemListOrderDescending",
			numberOfItems: itemListElements.length,
			itemListElement: itemListElements,
		};
		allSchemas.push(itemListSchema);
	}

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
