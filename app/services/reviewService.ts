import axios from "axios";
import { Mfo } from "./mfosService";

export type ReviewReply = {
  id: number;
  author_name: string;
  review_text: string;
  helpful_count: number;
  not_helpful_count: number;
  is_reply: boolean;
  admin_response: string | null;
  admin_response_at: string | null;
  admin_response_author: string | null;
  created_at: string;
  // Nested replies (rare, but API supports array)
  replies: ReviewReply[];
};

export interface Review {
  id: number;
  author_name: string;
  review_text: string;
  rating: number;
  helpful_count: number;
  not_helpful_count: number;
  admin_response: string | null;
  admin_response_at: string | null;
  admin_response_author: string | null;
  created_at: string;
  mfo: {
    id: number;
    name: string;
    slug: string;
    logo_url: string;
  };
  // Replies to this review
  replies?: ReviewReply[];
}

export type SortType = "newest" | "helpful" | "rating_desc" | "rating_asc";

export interface GetReviewsParams {
  page?: number;
  mfo_slug?: string;
  mfo_id?: number;
  rating?: number;
  sort?: SortType;
}

// Тип ответа API
export interface ReviewsApiResponse {
  mfo: Mfo;
  data: Review[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  links?: {
    first?: string;
    last?: string;
    next?: string | null;
    prev?: string | null;
  };
}

export interface CreateReviewParams {
  mfo_id: number;
  author_name: string;
  author_email: string;
  review_text: string;
  speed_rating: number;
  conditions_rating: number;
  support_rating: number;
  website_rating: number;
}
export interface ReviewStatisticsResponse {
  total_reviews: number;
  total_mfos: number;
}
// Ответ от API на POST /reviews
interface CreateReviewResponse {
  message: string;
  review: Review;
}
export const getReviewStatistics =
  async (): Promise<ReviewStatisticsResponse> => {
    try {
      const response = await axios.get<ReviewStatisticsResponse>(
        "https://api.mfoxa.com.ua/api/v1/reviews/statistics"
      );
      return response.data;
    } catch (error) {
      console.error("getReviewStatistics error:", error);
      throw new Error("Failed to fetch review statistics");
    }
  };

export const getReviews = async (
  params: GetReviewsParams = {}
): Promise<ReviewsApiResponse> => {
  const url = new URL("https://api.mfoxa.com.ua/api/v1/reviews");
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    next: {
      revalidate: 60,
    },
  });

  if (!res.ok) {
    console.error("getReviews error:", res.statusText);
    throw new Error("Failed to fetch reviews");
  }

  const data: ReviewsApiResponse = await res.json();
  return data;
};

export const createReview = async (
  data: CreateReviewParams
): Promise<CreateReviewResponse> => {
  try {
    const response = await axios.post<CreateReviewResponse>(
      "https://api.mfoxa.com.ua/api/v1/reviews",
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error("Validation errors:", error.response.data.errors);
      throw error.response.data;
    }
    console.error("createReview error:", error);
    throw new Error("Failed to create review");
  }
};

// Тип для запроса на создание ответа
export interface CreateReviewReplyParams {
  parent_id: number;
  author_name: string;
  review_text: string;
}

// Ответ от API
export interface CreateReviewReplyResponse {
  message: string;
  reply: {
    id: number;
    parent_id: number;
    author_name: string;
    review_text: string;
    created_at: string;
  };
}

// Функция для отправки ответа на отзыв
export const createReviewReply = async (
  data: CreateReviewReplyParams
): Promise<CreateReviewReplyResponse> => {
  try {
    const response = await axios.post<CreateReviewReplyResponse>(
      "https://api.mfoxa.com.ua/api/v1/reviews/reply",
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error("Validation errors:", error.response.data.errors);
      throw error.response.data;
    }
    console.error("createReviewReply error:", error);
    throw new Error("Failed to create review reply");
  }
};
export interface ReviewVoteResponse {
  message: string;
  helpful_count: number;
  not_helpful_count: number;
  user_vote?: "helpful" | "not_helpful";
}

// Отметить отзыв как полезный
export const markReviewHelpful = async (
  id: number
): Promise<ReviewVoteResponse> => {
  try {
    const response = await axios.post<ReviewVoteResponse>(
      `https://api.mfoxa.com.ua/api/v1/reviews/${id}/helpful`
    );
    return response.data;
  } catch (error) {
    console.error("markReviewHelpful error:", error);
    throw new Error("Failed to mark review as helpful");
  }
};

// Отметить отзыв как неполезный
export const markReviewNotHelpful = async (
  id: number
): Promise<ReviewVoteResponse> => {
  try {
    const response = await axios.post<ReviewVoteResponse>(
      `https://api.mfoxa.com.ua/api/v1/reviews/${id}/not-helpful`
    );
    return response.data;
  } catch (error) {
    console.error("markReviewNotHelpful error:", error);
    throw new Error("Failed to mark review as not helpful");
  }
};
