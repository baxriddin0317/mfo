"use client";

import AboutButtons from "@/app/components/AboutButtons";
import Bread from "@/app/components/Bread";
import TermsOfRegistration from "@/app/components/TermsOfRegistration";
import ButtonGreenBorder from "@/app/ui/ButtonGreenBorder";
import Dropdown from "@/app/ui/Dropdown";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getReviews,
  markReviewHelpful,
  markReviewNotHelpful,
  ReviewsApiResponse,
  ReviewStatisticsResponse,
  SortType,
} from "../services/reviewService";
import type { ReviewReply } from "../services/reviewService";
import ReviewModal from "./Modals/ReviewModal";
import AnswerQap from "./Modals/AnswerQap";
import { PageDatesResponse } from "../services/PageDatesService";
import { MicrodataReviews } from "../structured-data/MicrodataReviews";
import { MfoDetails } from "../services/getMfoDetailsService";
import { getDefaultWebPageSchema } from "../structured-data/defaults";
import { LangType } from "../services/HomeService";

type CircleRatingProps = {
  value: number;
  color: string;
};

const CircleRating: React.FC<CircleRatingProps> = ({ value, color }) => (
  <svg width="32" height="32" viewBox="0 0 50 50">
    <circle cx="25" cy="25" r="23" stroke="#eee" strokeWidth="2" fill="none" />
    <circle
      cx="25"
      cy="25"
      r="23"
      stroke={color}
      strokeWidth="4"
      fill="none"
      strokeDasharray={`${(value / 5) * 144}, 144`}
      transform="rotate(-90 25 25)"
      strokeLinecap="round"
    />
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill={color}
    >
      {value}
    </text>
  </svg>
);

const getColor = (value: number): string => {
  if (value >= 0 && value < 1) return "#8B0000";
  if (value >= 1 && value < 2) return "#FF0000";
  if (value >= 2 && value < 3) return "#ffde33";
  if (value >= 3 && value < 4) return "#FFA500";
  if (value >= 4 && value <= 5) return "#00FF00";
  return "#8B0000";
};

export default function CompanyRewiwsClient({
  slug,
  dates,
  lang,
  mfoData,
  initialReviews,
  stats,
}: {
  slug: string;
  dates?: PageDatesResponse | null;
  lang: string;
  mfoData: MfoDetails;
  initialReviews: ReviewsApiResponse;
  stats?: ReviewStatisticsResponse;
}) {
  const t = useTranslations("Reviews");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openReplyId, setOpenReplyId] = useState<number | null>(null);
  const [data, setData] = useState<ReviewsApiResponse | null>(initialReviews);
  const [visibleCount, setVisibleCount] = useState(6);
  const [sort, setSort] = useState<SortType>("newest");

  const formatRating = (ratingStr: string | undefined) => {
    if (!ratingStr) return "";
    const rating = parseFloat(ratingStr);
    if (isNaN(rating)) return "";
    return rating.toFixed(1).replace(".", ",");
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const options =
    lang === "ua"
      ? [
          { label: "Спочатку нові", value: "newest" },
          { label: "За корисністю", value: "helpful" },
          { label: "За рейтингом ↓", value: "rating_desc" },
          { label: "За рейтингом ↑", value: "rating_asc" },
        ]
      : [
          { label: "Сначала новые", value: "newest" },
          { label: "По полезности", value: "helpful" },
          { label: "По рейтингу ↓", value: "rating_desc" },
          { label: "По рейтингу ↑", value: "rating_asc" },
        ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews({
          mfo_slug: slug,
          sort: sort as SortType,
        });
        setData(data);
      } catch (error) {
        console.error("Ошибка при загрузке отзывов:", error);
      }
    };

    fetchReviews();
  }, [slug, sort]);

  const handleVote = async (id: number, type: "helpful" | "not_helpful") => {
    if (!data) return;
    try {
      const voteFn =
        type === "helpful" ? markReviewHelpful : markReviewNotHelpful;
      const response = await voteFn(id);
      const updatedReviews = data.data.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            helpful_count: response.helpful_count,
            not_helpful_count: response.not_helpful_count,
          };
        }
        return review;
      });
      setData({ ...data, data: updatedReviews });
    } catch (error) {
      console.error("Ошибка при голосовании:", error);
    }
  };

  const closeAnswerModal = () => setOpenReplyId(null);

  const getCompanyName = () => {
    if (data?.mfo?.name) return data.mfo.name;
    if (mfoData?.name) return mfoData.name;
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const webPageSchema = getDefaultWebPageSchema({
    lang: lang as LangType,
    title: t("title", { company: getCompanyName() }),
    description: "Отзывы",
    dates: {
      date_published:
        dates?.date_published || mfoData.created_at || "2023-01-01",
      date_modified: dates?.date_modified || mfoData.updated_at || "2025-07-12",
    },
    path: `/mfo/${slug}/reviews`,
  });

  return (
    <>
      <MicrodataReviews
        reviewsData={data}
        companyName={getCompanyName()}
        companySlug={slug}
        locale={lang as "ua" | "ru"}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema),
        }}
      />
      <Bread lang={lang as "ru" | "ua"} companyName={getCompanyName()} />
      <div className="px-0 md:px-[20px]">
        <h1
          className="text-[20px] sm:text-[28px] md:text-[36px] font-[700] leading-[100%] text-[#222] mb-[14px] sm:mb-[25px] md:mb-[30px]"
          style={{ fontFamily: "var(--Jakarta)" }}
        >
          {t("title", {
            company: getCompanyName(),
          })}
        </h1>
      </div>
      <AboutButtons />
      <div className="px-0 md:px-[20px]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between md:mb-[20px] mb-[10px] sm:mb-[40px] mt-[30px] w-full rounded-lg bg-white border border-[#724dea] p-[20px] shadow-md gap-[10px]">
          <div className="flex gap-[14px] sm:gap-[16px] md:gap-[20px] items-center mb-4 md:mb-0">
            {data?.mfo?.logo_url ? (
              <Image
                src={data.mfo.logo_url}
                alt={t("logoAlt")}
                width={100}
                height={50}
                className="h-[52px] md:h-[96px] object-contain"
              />
            ) : (
              <div className="w-[163px] md:w-[300px] h-[52px] md:h-[96px] bg-gray-200 animate-pulse rounded" />
            )}
            <div className="flex flex-col gap-[1px] items-center">
              <p className="text-nowrap font-medium text-[11px] leading-[145%] text-[#222]">
                {stats?.total_mfos
                  ? `${lang === "ua" ? "із" : "из"} ${stats.total_mfos} ${lang === "ua" ? "МФО" : "МФО"}`
                  : t("mfoCount")}
              </p>
              <p className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[133%] text-[#222]">
                {data?.mfo?.rating_position
                  ? `${data.mfo.rating_position} ${lang === "ua" ? "місце" : "место"}`
                  : t("rank")}
              </p>
            </div>
            <div className="flex flex-col gap-[1px] items-center">
              <p className="font-medium text-[11px] leading-[145%] text-[#222]">
                {t("reviewsCountLabel")}
              </p>
              <p className="font-bold text-[14px] sm:text-[16px] md:text-[18px] leading-[133%] text-[#222]">
                {data?.mfo?.rating_count ?? 0}
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-[10px] items-center w-full md:w-auto">
            <div className="flex gap-[8px] w-full items-center">
              <div className="relative w-[74px] h-[74px]">
                <Image
                  src="/Frame 163.png"
                  alt="rating"
                  width={74}
                  height={74}
                  className="object-contain"
                />
                <div className="absolute inset-1 mt-3 flex flex-col items-center justify-center">
                  <span
                    style={{
                      color: getColor(data?.mfo?.rating_average ?? 0),
                    }}
                    className="text-[15px] font-bold leading-none"
                  >
                    {formatRating(String(data?.mfo?.rating_average ?? 0))}
                  </span>
                  <span className="text-black text-[10px] font-bold">
                    {data?.mfo?.rating_position
                      ? `${data.mfo.rating_position} ${lang === "ua" ? "місце" : "место"}`
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-[10px] md:gap-[14px]">
                <p className="font-bold text-[12px] text-start text-nowrap sm:text-[14px] md:text-[16px] leading-[100%] text-[#222]">
                  {t("ratingsTitle", {
                    company: getCompanyName(),
                  })}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-[10px] md:gap-[14px] items-center">
                  {data?.mfo?.ratings &&
                    Object.entries(data.mfo.ratings).map(
                      ([key, rating], index) => (
                        <div
                          key={key}
                          className="flex items-center gap-[6px] md:gap-[10px]"
                        >
                          <CircleRating
                            value={rating.value}
                            color={getColor(rating.value)}
                          />
                          <span
                            className="font-medium text-[11px] leading-[145%] text-[#222]"
                            style={{
                              maxWidth: "70px",
                            }}
                          >
                            {t(`ratings.${index}.label`)}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-0 md:px-[20px]">
        <div className="flex gap-[10px] justify-between items-center">
          <Dropdown
            endpoint="https://api.mfoxa.com.ua/api/v1/reviews"
            mfoSlug={data?.mfo.slug}
            options={options}
            lang={lang as "ua" | "ru"}
            onChange={(val) => setSort(val as SortType)} // <== передаём выбранный сорт
          />
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00ba9e] text-white font-bold text-[14px] rounded-[8px] px-[16px] py-[9.5px] w-full sm:w-[235px] text-center cursor-pointer"
          >
            <p className="m-0 p-0">{t("writeReview")}</p>
          </div>
          {data?.mfo?.id && (
            <ReviewModal
              mfoName={data?.mfo?.name}
              mfoId={data?.mfo?.id}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          )}
        </div>
      </div>
      <div className="px-0 md:px-[20px]">
        {Array.isArray(data?.data) && data.data.length > 0 ? (
          data.data.slice(0, visibleCount).map((review, i) => (
            <React.Fragment key={review.id}>
              <AnswerQap
                parent_id={review.id}
                author_name={review.author_name || t(`reviews.${i}.user`)}
                date={new Date(review.created_at).toLocaleDateString()}
                isOpen={openReplyId === review.id}
                onClose={closeAnswerModal}
                type="review"
              />
              <div className="border-[1px] border-[#d6d6f9] p-[10px] md:p-[30px] bg-white rounded-lg mt-[10px]">
                <div className="flex gap-[10px] mb-[14px]">
                  <Image
                    src={review.mfo?.logo_url}
                    alt={t("reviewLogoAlt")}
                    width={40}
                    height={40}
                    className="rounded-full object-contain"
                  />
                  <div className="flex flex-col">
                    <p
                      className="font-[700] text-[12px] leading-[142%] text-[#222]"
                      style={{
                        fontFamily: "var(--Montserrat)",
                      }}
                    >
                      {review.author_name || t(`reviews.${i}.user`)}
                    </p>
                    <p className="font-medium text-[10px] leading-[180%] text-[#67677A] flex items-start gap-1">
                      <span className="font-bold text-[20px] leading-[138%] text-[#724DEA]">
                        {review.rating}
                      </span>
                      <span className="mb-2">{t("ratingsRange")}</span>
                    </p>
                  </div>
                </div>
                <p
                  className="mb-[10px]"
                  style={{
                    fontFamily: "var(--Montserrat)",
                    fontWeight: 500,
                    fontSize: "13px",
                    lineHeight: "138%",
                    color: "#222",
                  }}
                >
                  {review.review_text}
                </p>
                {Array.isArray(review.replies) && review.replies.length > 0 && (
                  <div className="mt-[12px] space-y-2">
                    <RepliesList replies={review.replies} lang={lang} />
                  </div>
                )}
                {review.admin_response && (
                  <div className="rounded-lg p-2.5 w-full mb-[10px] bg-[#ebebf9]">
                    <div className="flex gap-[10px]">
                      <svg
                        width="16"
                        height="17"
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.4 3.96692H1V10.3669H4.2V13.5669H7.4V3.96692Z"
                          stroke="#724DEA"
                          strokeWidth="2"
                        />
                        <path
                          d="M15 3.96692H8.6V10.3669H11.8V13.5669H15V3.96692Z"
                          stroke="#724DEA"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className="font-bold text-[13px] leading-[138%] text-[#724dea]">
                        {review.admin_response_author ||
                          t(`reviews.${i}.replyUser`)}
                      </p>
                    </div>
                    <p className="ml-[26px] font-medium text-[13px] sm:text-[15px] leading-[133%] text-[#222]">
                      {review.admin_response || t(`reviews.${i}.replyText`)}
                    </p>
                  </div>
                )}
                <p
                  onClick={() => setOpenReplyId(review.id)}
                  className="mb-[14px] w-max md:mb-[18px] font-medium text-[13px] leading-[138%] text-[#724dea] underline [text-decoration-skip-ink:none] cursor-pointer hover:text-[#532bbf] hover:no-underline"
                >
                  {t("reply")}
                </p>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-[13px] leading-[138%] text-[#222]">
                    {t("reviewUseful")}
                  </p>
                  <div className="flex gap-[10px]">
                    <div
                      onClick={() => handleVote(review.id, "helpful")}
                      className="border border-[#00ba9e] rounded-lg px-[10px] py-[8px] whitespace-nowrap h-[34px] flex items-center justify-center cursor-pointer text-[#00ba9e] hover:bg-[#00ba9e] hover:text-white hover:border-[#00ba9e] transition-colors duration-200"
                    >
                      <p className="font-medium text-[13px] leading-[138%] text-center m-0">
                        {t("yes", {
                          count: review.helpful_count,
                        })}
                      </p>
                    </div>
                    <div
                      onClick={() => handleVote(review.id, "not_helpful")}
                      className="border border-[#f22a52] rounded-lg px-[10px] py-[8px] whitespace-nowrap h-[34px] flex items-center justify-center cursor-pointer text-[#f22a52] hover:bg-[#f22a52] hover:text-white hover:border-[#f22a52] transition-colors duration-200"
                    >
                      <p className="font-medium text-[13px] leading-[138%] text-center m-0">
                        {t("no", {
                          count: review.not_helpful_count,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-400"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("noReviews")}
            </h3>
            <p className="text-gray-600 mb-4">{t("beFirstToReview")}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00ba9e] text-white font-bold text-[14px] rounded-[8px] px-[16px] py-[9.5px] hover:bg-[#009680] transition-colors"
            >
              {t("writeFirstReview")}
            </button>
          </div>
        )}
      </div>
      {data?.data &&
        Array.isArray(data.data) &&
        visibleCount < data.data.length && (
          <div className="px-0 md:px-[20px]">
            <ButtonGreenBorder
              width="100%"
              text={t("showMore")}
              className="mt-[20px] md:mt-[40px] mb-[20px] md:mb-[50px]"
              onClick={handleLoadMore}
            />
          </div>
        )}

      {data && data.mfo && <TermsOfRegistration mfo={data.mfo} />}
      <div className="px-0 md:px-[20px]">
        <p className="font-medium text-[13px] mt-[50px] leading-[138%] text-[#67677a]">
          {dates?.date_published
            ? t("metadata.addedDate") +
              " " +
              new Date(dates.date_published).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : t("metadata.addedDate")}
        </p>
        <p className="font-medium text-[13px] leading-[138%] text-[#67677a]">
          {dates?.date_modified && dates.date_modified !== dates?.date_published
            ? t("metadata.updatedDate") +
              " " +
              new Date(dates.date_modified).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : t("metadata.updatedDate") +
              " " +
              new Date().toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
        </p>
      </div>
    </>
  );
}

type RepliesListProps = {
  replies: ReviewReply[];
  lang: string;
};

function RepliesList({ replies, lang }: RepliesListProps) {
  return (
    <div className={`space-y-2 mb-2`}>
      {replies.map((reply) => (
        <div key={reply.id} className="bg-[#EBEBF9] p-[10px] rounded-[8px]">
          <div className="flex items-start gap-[8px]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.4 3.48438H1V9.88437H4.2V13.0844H7.4V3.48438Z"
                stroke="#724DEA"
                stroke-width="2"
              />
              <path
                d="M15 3.48438H8.6V9.88437H11.8V13.0844H15V3.48438Z"
                stroke="#724DEA"
                stroke-width="2"
              />
            </svg>

            <div className="flex-1">
              <p
                className="font-[700] text-[12px] leading-[142%] text-[#222]"
                style={{ fontFamily: "var(--Montserrat)" }}
              >
                {reply.author_name ||
                  (lang === "ua" ? "Користувач" : "Пользователь")}
              </p>
              <p
                className="font-medium text-[12px] leading-[140%] text-[#222]"
                style={{ fontFamily: "var(--Montserrat)" }}
              >
                {reply.review_text}
              </p>
              {Array.isArray(reply.replies) && reply.replies.length > 0 && (
                <div className="mt-2">
                  <RepliesList replies={reply.replies} lang={lang} />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
