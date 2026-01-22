/* eslint-disable @typescript-eslint/no-explicit-any */
// services/ratingService.ts

export type RateAuthorResponse = {
  message: string;
  data: {
    user_rating: number;
    author_average_rating: number;
    author_total_ratings: number;
  };
};

export type RateAuthorError = {
  message: string;
  errors?: Record<string, any>;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

export async function rateAuthor(
  authorId: number,
  rating: number,
  lang: string = "uk"
): Promise<RateAuthorResponse> {
  try {
    const res = await fetch(
      `${API_URL}/api/v1/authors/${authorId}/rate?lang=${
        lang === "ua" ? "uk" : "ru"
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      // Валидационная ошибка или автор не найден
      throw data as RateAuthorError;
    }

    return data as RateAuthorResponse;
  } catch (error: any) {
    if (error?.message) {
      throw error;
    }

    throw new Error("Unexpected error during rating");
  }
}
