import { ReviewsApiResponse } from "@/app/services/reviewService";
import { getValidRatingOrCount } from "../lib/utils";
// import { emptyAddress } from "./defaults";

type MicrodataReviewsProps = {
	reviewsData: ReviewsApiResponse | null;
	companyName: string;
	companySlug: string;
	locale: "ru" | "ua";
};

export const MicrodataReviews = ({
	reviewsData,
	companyName,
	companySlug,
	locale,
}: MicrodataReviewsProps) => {
	if (
		!reviewsData ||
		!reviewsData.data ||
		!Array.isArray(reviewsData.data) ||
		reviewsData.data.length === 0
	)
		return null;

	// Пример сортировки: новые → полезные → рейтинг по убыванию
	const sortedReviews = [...reviewsData.data].sort((a, b) => {
		const dateA = new Date(a.created_at).getTime();
		const dateB = new Date(b.created_at).getTime();

		if (dateB !== dateA) return dateB - dateA; // новые первыми
		if ((b.helpful_count || 0) !== (a.helpful_count || 0))
			return (b.helpful_count || 0) - (a.helpful_count || 0); // полезные первыми
		return (b.rating || 0) - (a.rating || 0); // по рейтингу убывание
	});

	const financialServiceSchema = {
		"@context": "https://schema.org",
		"@type": "FinancialService",
		name: companyName,
		url: `https://mfoxa.com.ua/${locale}/mfo/${companySlug}`,
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: reviewsData.mfo?.rating_average || 0,
			reviewCount: reviewsData.mfo?.rating_count || 0,
			bestRating: 5,
			worstRating: 1,
		},
		// telephone: "-",
		priceRange: "$$",
		image: `https://mfoxa.com.ua/logo.png`,
		// address: emptyAddress,
		review: sortedReviews.map((review) => ({
			"@type": "Review",
			author: {
				"@type": "Person",
				name: review.author_name || "Аноним",
			},
			datePublished: review.created_at,
			reviewBody: review.review_text,
			reviewRating: {
				"@type": "Rating",
				ratingValue: +getValidRatingOrCount(review.rating),
				bestRating: 5,
				worstRating: 1,
			},
			...(review.admin_response && {
				comment: {
					"@type": "Comment",
					text: review.admin_response,
					author: {
						"@type": "Organization",
						name: review.admin_response_author || companyName,
					},
				},
			}),
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(financialServiceSchema, null, 2),
			}}
		/>
	);
};
