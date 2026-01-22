type MicrodataCalculatorProps = {
	companyName: string;
	locale: "ru" | "ua";
};

export const MicrodataCalculator = ({
	companyName,
	locale,
}: MicrodataCalculatorProps) => {
	const calculatorSchema = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name:
			locale === "ru"
				? `Калькулятор процентов ${companyName}`
				: `Калькулятор відсотків ${companyName}`,
		applicationCategory: "FinancialApplication",
		operatingSystem: "Web",
		url: `https://mfoxa.com.ua/${locale}/mfo/${companyName
			.toLowerCase()
			.replace(/\s/g, "-")}`,
		offers: {
			"@type": "Offer",
			price: "0", // калькулятор бесплатный
			priceCurrency: "UAH",
			availability: "https://schema.org/InStock",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: 5,
			ratingCount: 1,
			bestRating: 5,
			worstRating: 1,
		},
	};

	return (
		<script
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(calculatorSchema),
			}}
			type="application/ld+json"
		/>
	);
};
