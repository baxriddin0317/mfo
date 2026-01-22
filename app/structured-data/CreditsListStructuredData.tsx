import React from "react";

import { MfoDetails } from "../services/getMfoDetailsService";

interface Props {
	credits: MfoDetails[];
	pageUrl: string;
	pageTitle: string;
}

const CreditsListStructuredData: React.FC<Props> = ({
	credits,
	pageUrl,
	pageTitle,
}) => {
	const itemListSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: pageTitle,
		itemListOrder: "https://schema.org/ItemListOrderAscending",
		numberOfItems: credits.length,
		itemListElement: credits.map((credit, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "FinancialService",
				name: credit.name,
				url: `https://mfoxa.com.ua/mfo/${credit.slug}`,
				logo: credit.logo_url,
				mainEntityOfPage: pageUrl,
				image: credit.logo_url,
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: +credit.rating_average
						? credit.rating_average
						: 5,
					reviewCount: +credit.rating_count || 1,
				},
				provider: {
					"@type": "Organization",
					name: credit.legal_entity || credit.name,
					...(credit.nbu_license
						? {
								additionalProperty: {
									"@type": "PropertyValue",
									name: "Лицензия НБУ",
									value: credit.nbu_license,
								},
						  }
						: {}),
				},
				makesOffer: credit.catalog_offers?.map((offer) => ({
					"@type": "Offer",
					name:
						offer.client_type === "new"
							? "Первый кредит"
							: offer.client_type === "repeat"
							? "Повторный кредит"
							: "Кредит",
					url: credit.get_money_button_url,
					itemOffered: {
						"@type": "LoanOrCredit",
						name: credit.name,
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
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(itemListSchema),
			}}
		/>
	);
};

export default CreditsListStructuredData;
