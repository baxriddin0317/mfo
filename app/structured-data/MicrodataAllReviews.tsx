import { useTranslations } from "next-intl";
type Review = {
	id: number;
	mfo: { name: string; logo_url: string; slug: string };
	rating: number;
	author_name: string;
	review_text: string;
	created_at: string;
};

type MicrodataAllReviewsProps = {
	reviews: Review[];
	locale: "ru" | "ua";
};

export const MicrodataAllReviews = ({
	reviews,
	locale,
}: MicrodataAllReviewsProps) => {
	const t = useTranslations("ReviewsPage");

	if (!reviews || reviews.length === 0) return null;

	const reviewsSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name:
			t("title") ||
			(locale === "ua"
				? "Всі відгуки про МФО"
				: "Все отзывы об МФО Украины"),
		itemListElement: reviews.map((review, index) => ({
			"@type": "ListItem",
			position: index + 1,
			item: {
				"@type": "Review",
				author: {
					"@type": "Person",
					name:
						review.author_name ||
						(locale === "ua" ? "Анонім" : "Аноним"),
				},
				datePublished: review.created_at || new Date().toISOString(),
				reviewBody: review.review_text,
				reviewRating: {
					"@type": "Rating",
					ratingValue: review?.rating || 5,
					bestRating: 5,
					worstRating: 1,
				},
				itemReviewed: {
					"@type": "FinancialService",
					name: review.mfo.name,
					url: `https://mfoxa.com.ua/${locale}/mfo/${review.mfo.slug}`,
					priceRange: "$$",
					// telephone: "-",
					image: review.mfo.logo_url,
					// address: emptyAddress,
				},
			},
		})),
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
		/>
	);
};
