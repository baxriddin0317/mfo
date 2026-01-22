"use client";
import React from "react";

interface Company {
	name: string;
	url: string;
	ratingValue: number;
	reviewCount: number;
	position: number;
}

interface Props {
	companies: Company[];
}

export const MfoListStructuredData: React.FC<Props> = ({ companies }) => {
	const data = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: companies.map((company) => ({
			"@type": "ListItem",
			position: company.position,
			item: {
				"@type": "Organization",
				name: company.name,
				url: company.url,
				aggregateRating: {
					"@type": "AggregateRating",
					ratingValue: String(+company?.ratingValue || 5),
					bestRating: "5",
					ratingCount: String(+company?.reviewCount || 1),
				},
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
};
