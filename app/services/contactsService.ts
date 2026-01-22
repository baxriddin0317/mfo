import axios from "axios";

// Типы для запроса
export interface ContactFormParams {
  name: string;
  email: string;
  message: string;
  privacy_accepted: boolean;
  notifications_enabled: boolean;
}

// Типы для ответа
export interface ContactFormResponse {
  message: string;
  reference_id: number;
}

export class ContactsService {
  static async sendContactForm(
    data: ContactFormParams
  ): Promise<ContactFormResponse> {
    try {
      const response = await axios.post<ContactFormResponse>(
        "https://api.mfoxa.com.ua/api/v1/contacts",
        data
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          // Валидационные ошибки
          throw new Error("Validation error");
        }
        if (error.response?.status === 429) {
          // Слишком много запросов
          throw new Error("Too many requests");
        }
      }
      throw new Error("Failed to send contact form");
    }
  }
}
