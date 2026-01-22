import axios from "axios";

export type Question = {
  id: number;
  author_name: string;
  question_text: string;
  answer_text: string | null;
  helpful_count: number;
  not_helpful_count: number;
  status: "approved" | "pending" | "rejected";
  answered_at: string | null;
  answer_author: string | null;
  is_reply?: boolean;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  mfo: {
    id: number;
    name: string;
    slug: string;
    logo_url: string;
  } | null;
  replies?: Question[];
};

export type QuestionsResponse = {
  data: Question[];
  meta: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
  links: {
    first?: string;
    last?: string;
    next?: string | null;
    prev?: string | null;
  };
};

export type QuestionsQueryParams = {
  page?: number;
  per_page?: number;
  mfo_slug?: string;
  sort?: "newest" | "helpful" | "answered" | "unanswered";
};

// export async function getQuestions(params: QuestionsQueryParams = {}): Promise<QuestionsResponse> {
//   const response = await axios.get<QuestionsResponse>(`https://api.mfoxa.com.ua/api/v1/questions`, {
//     params,
//   });
//   return response.data;
// }

export async function getQuestions(
  params: QuestionsQueryParams = {}
): Promise<QuestionsResponse> {
  const url = new URL("https://api.mfoxa.com.ua/api/v1/questions");
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
    throw new Error(`Failed to fetch questions: ${res.statusText}`);
  }

  const data: QuestionsResponse = await res.json();
  return data;
}

export const helpfulQuestions = async (id: number) => {
  try {
    const response = await axios.post(
      `https://api.mfoxa.com.ua/api/v1/questions/${id}/helpful`
    );
    return response.data;
  } catch (error) {
    console.error("getReviews error:", error);
    throw new Error("Failed to fetch reviews");
  }
};

export const notHelpfulQuestions = async (id: number) => {
  try {
    const response = await axios.post(
      `https://api.mfoxa.com.ua/api/v1/questions/${id}/not-helpful`
    );
    return response.data;
  } catch (error) {
    console.error("getReviews error:", error);
    throw new Error("Failed to fetch reviews");
  }
};

export interface CreateQuestionParams {
  mfo_id: number;
  author_name: string;
  author_email: string;
  question_text: string;
}

export interface CreateQuestionResponse {
  message: string;
  question: Question;
}

export const createQuestion = async (
  data: CreateQuestionParams
): Promise<CreateQuestionResponse> => {
  try {
    const response = await axios.post<CreateQuestionResponse>(
      "https://api.mfoxa.com.ua/api/v1/questions",
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error("Validation errors:", error.response.data.errors);
      throw error.response.data;
    }
    console.error("createQuestion error:", error);
    throw new Error("Failed to create question");
  }
};

export interface CreateQuestionReplyParams {
  parent_id: number;
  author_name: string;
  question_text: string;
}

export interface CreateQuestionReplyResponse {
  message: string;
  reply: {
    id: number;
    parent_id: number;
    author_name: string;
    question_text: string;
    created_at: string;
  };
}

export const createQuestionReply = async (
  data: CreateQuestionReplyParams
): Promise<CreateQuestionReplyResponse> => {
  try {
    const response = await axios.post<CreateQuestionReplyResponse>(
      "https://api.mfoxa.com.ua/api/v1/questions/reply",
      data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      console.error("Validation errors:", error.response.data.errors);
      throw error.response.data;
    }
    console.error("createQuestionReply error:", error);
    throw new Error("Failed to create question reply");
  }
};
