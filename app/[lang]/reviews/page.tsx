// app/[lang]/reviews/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import authorsService from "@/app/services/authorsService";
import { getReviewStatistics } from "@/app/services/reviewService";
import { FaqsService } from "@/app/services/FaqService";
import settingsService from "@/app/services/settingsService";
import { ReviewsStructuredData } from "@/app/structured-data/ReviewsStructuredData";
import { getPageDates } from "@/app/services/PageDatesService";
import { generateAlternates } from "@/app/lib/metadataUtils";

// Lazy load heavy components for better initial load performance
const ReviewsClient = dynamic(() => import("@/app/components/ReviewsPage"), {
	loading: () => <div className="h-[400px] animate-pulse bg-gray-200 rounded" />,
	ssr: true,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "Metadata" });
  let getAllSettings;

  try {
    getAllSettings = await settingsService.getSettingsByGroup(
      "reviews_page",
      lang === "ua" ? "uk" : "ru",
    );
  } catch (error) {
    console.error("Ошибка при получении настроек:", error);
  }

  const alternates = generateAlternates(["reviews"], lang);
  const defaultTitle = t("reviewss.title") || "Отзывы об МФО Украины — Честные мнения клиентов";
  const defaultDescription = t("reviewss.description") || "Читайте отзывы клиентов о микрофинансовых организациях Украины. Реальный опыт, оценки и советы от заемщиков.";

  const title = getAllSettings?.settings.reviews_page_meta_title || defaultTitle;
  const description = getAllSettings?.settings.reviews_page_meta_description || defaultDescription;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: alternates.canonical,
      siteName: "MFoxa",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ReviewsPageWrapper({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ count?: string; sort?: string }>;
}) {
  const { lang } = await params;
  const { count, sort } = await searchParams;
  const reviewsCount = count ? parseInt(count, 10) : 16;

  // Parallel загрузка данных для оптимизации производительности
  const langParam = lang === "ua" ? "uk" : "ru";
  
  // Загружаем все данные параллельно для ускорения
  const [randomAuthorResult, statsResult, faqsResult, datesResult, getAllSettingsResult] = await Promise.allSettled([
    authorsService.getRandomAuthor(langParam),
    getReviewStatistics(),
    FaqsService.getFaqs({
    page_name: "reviews",  
      lang: langParam,
    }),
    getPageDates({ type: "reviews" }),
    settingsService.getSettingsByGroup("reviews_page", langParam),
  ]);

  // Обработка результатов с fallback значениями
  const randomAuthor = randomAuthorResult.status === "fulfilled" 
    ? randomAuthorResult.value 
    : {
        data: {
          id: 0,
          name: "",
          education: "",
          work_experience: "",
          additional_qualification: "",
          avatar: "/photo.svg",
        },
        meta: {
          language: langParam as "uk" | "ru",
          total_authors: 0,
          generated_at: new Date().toISOString(),
        }
      } as import("@/app/services/authorsService").AuthorRandomResponse;

  const stats = statsResult.status === "fulfilled" 
    ? statsResult.value 
    : { total_reviews: 0, total_mfos: 0 };

  const faqs = faqsResult.status === "fulfilled" ? faqsResult.value : [];
  
  const dates = datesResult.status === "fulfilled" 
    ? datesResult.value 
    : { 
        date_published: new Date().toISOString(), 
        date_modified: new Date().toISOString(),
        type: "reviews"
      };

  let getAllSettings;
  if (getAllSettingsResult.status === "fulfilled") {
    getAllSettings = getAllSettingsResult.value;
  } else {
    console.error("Ошибка при получении настроек:", getAllSettingsResult.reason);
    getAllSettings = undefined;
  }

  return (
    <>
      <ReviewsStructuredData
        lang={lang as "ru" | "ua"}
        dates={dates}
        getAllSettings={getAllSettings}
      />
      <ReviewsClient
        stats={stats}
        getAllSettings={getAllSettings}
        faqs={faqs}
        randomAuthor={randomAuthor}
        locale={lang}
        reviewsCount={reviewsCount}
        selectedSortKey={sort || ""}
      />
    </>
  );
}
