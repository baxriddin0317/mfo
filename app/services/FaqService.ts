import axios from "axios";

// Параметры запроса FAQ
export interface GetFaqsParams {
  lang?: "uk" | "ru";
  page_name: "mfo" | "loan" | "reviews";
}

// Тип одного FAQ
export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

// Тип ответа — массив FAQ
export type FaqsResponse = FaqItem[];

// Ошибка валидации
export interface ValidationErrorResponse {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

export class FaqsService {
  static async getFaqs(params: GetFaqsParams): Promise<FaqsResponse> {
    try {
      const response = await axios.get<FaqsResponse>(
        "https://api.mfoxa.com.ua/api/v1/faqs",
        { params }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400 || error.response?.status === 422) {
          // Ошибка валидации
          const data = error.response.data as ValidationErrorResponse;
          throw new Error(data.message);
        }
      }
      throw new Error("Failed to fetch FAQs");
    }
  }
}
