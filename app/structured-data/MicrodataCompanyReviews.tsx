import Script from "next/script";
import { Review } from "@/app/services/HomeService";

type MicrodataReviewsProps = {
  reviews: Review[];
  locale: "ru" | "ua";
  companySlug: string;
  companyName: string;
};

export const MicrodataReviews = ({ reviews, locale, companySlug, companyName }: MicrodataReviewsProps) => {
  const reviewsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Отзывы",
    itemListElement: reviews.slice(0, 5).map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.author_name || "Аноним"
        },
        datePublished: review.created_at,
        reviewBody: review.review_text,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating || 0,
          bestRating: 5,
          worstRating: 1
        },
        itemReviewed: {
          "@type": "FinancialService",
          name: companyName,
          url: `https://mfoxa.com.ua/${locale}/mfo/${companySlug}`
        }
      }
    }))
  };

  return (
    <Script id="reviews-schema" type="application/ld+json">
      {JSON.stringify(reviewsSchema, null, 2)}
    </Script>
  );
};