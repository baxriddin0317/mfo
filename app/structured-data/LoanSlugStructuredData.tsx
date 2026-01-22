"use client";

import React from "react";

type OfferType = {
	name: string;
	url: string;
	amount_min: number;
	amount_max: number;
	term_min: number;
	term_max: number;
	interestRate: number;
};

type FinancialServiceItem = {
	name: string;
	logo_url?: string;
	offers?: OfferType[];
	apr_min?: number;
	apr_max?: number;
	legal_name?: string;
	license?: string;
	url: string;
	rating_value?: number;
	review_count?: number;
};

type LoanSlugStructuredDataProps = {
	pageTitle: string;
	pageUrl: string;
	loans: FinancialServiceItem[];
};

export const LoanSlugStructuredData: React.FC<LoanSlugStructuredDataProps> = ({
	pageTitle,
	pageUrl,
	loans,
}) => {
	const itemListSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: pageTitle,
		itemListOrder: "https://schema.org/ItemListOrderAscending",
		numberOfItems: loans.length,
		itemListElement: loans.map((loan, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "FinancialService",
				name: loan.name,
				logo: loan.logo_url,
				makesOffer: loan.offers?.map((offer) => ({
					"@type": "Offer",
					name: offer.name,
					itemOffered: {
						"@type": "LoanOrCredit",
						name: offer.name,
						amount: {
							"@type": "MonetaryAmount",
							currency: "UAH",
							minValue: offer.amount_min,
							maxValue: offer.amount_max,
						},
						loanTerm: {
							"@type": "QuantitativeValue",
							unitText: "DAY",
							minValue: offer.term_min,
							maxValue: offer.term_max,
						},
						interestRate: offer.interestRate,
						annualPercentageRate: {
							"@type": "QuantitativeValue",
							unitText: "PERCENT",
							minValue: loan.apr_min ?? 0,
							maxValue: loan.apr_max ?? 0,
						},
						provider: {
							"@type": "Organization",
							name: loan.legal_name ?? loan.name,
							additionalProperty: loan.license
								? {
										"@type": "PropertyValue",
										name: "Лицензия НБУ",
										value: loan.license,
								  }
								: undefined,
						},
					},
					url: offer.url,
				})),
				url: loan.url,
				mainEntityOfPage: pageUrl,
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: loan.rating_value ?? 5,
					reviewCount:
						loan.review_count && loan.review_count > 0
							? loan.review_count
							: 1,
				},
				// address: emptyAddress,
				priceRange: "$$",
				image: loan?.logo_url || "https://mfoxa.com.ua/logo.png",
				// telephone: "-",
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
