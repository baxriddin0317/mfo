interface Tariff {
	id: number;
	name: string;
	amount: string;
	rate: string;
	term_days: number;
	real_annual_rate: string;
	get_money_url: string;
}

type MicrodataLoanOrCreditProps = {
	tariffs: Tariff[];
	companyName: string;
	companySlug: string;
	locale: "ru" | "ua";
};

export const MicrodataLoanOrCredit = ({
	tariffs,
	companyName,
	companySlug,
	locale,
}: MicrodataLoanOrCreditProps) => {
	const loanOrCreditSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: tariffs.map((tariff, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "LoanOrCredit",
				name: tariff.name,
				description: tariff.name,
				amount: {
					"@type": "MonetaryAmount",
					currency: "UAH",
					value: tariff.amount,
				},
				interestRate: tariff.rate,
				loanTerm: {
					"@type": "QuantitativeValue",
					value: tariff.term_days,
					unitText: "DAY",
				},
				provider: {
					"@type": "FinancialService",
					name: companyName,
					url: `https://mfoxa.com.ua/${locale}/mfo/${companySlug}`,
				},
				annualPercentageRate: tariff.real_annual_rate,
				url: tariff.get_money_url,
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(loanOrCreditSchema),
			}}
		/>
	);
};
