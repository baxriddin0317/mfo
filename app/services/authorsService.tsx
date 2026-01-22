import axios from "axios";

// Базовый URL из .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

// Типы
export type Language = "uk" | "ru";
export interface Author {
  id: number;
  name: string;
  education: string;
  work_experience: string;
  additional_qualification: string;
  avatar: string;
  role?: string;
  rating?: {
    average: number;
    total_ratings: number;
    user_rating?: number;
    has_user_rated?: boolean;
  };
}

export interface AuthorsListResponse {
  data: Author[];
  meta: {
    language: Language;
    total: number;
    generated_at: string;
  };
}

export interface AuthorDetailResponse {
  data: Author;
}

export interface AuthorRandomResponse {
  data: Author;
  meta: {
    language: Language;
    total_authors: number;
    generated_at: string;
  };
}

export interface ErrorResponse {
  message: string;
  meta?: {
    language: Language;
    total_authors?: number;
    generated_at: string;
  };
}

// Базовая конфигурация axios
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    Accept: "application/json",
  },
});

// Сервис авторов
const authorsService = {
  async getAllAuthors(lang: Language = "uk"): Promise<AuthorsListResponse> {
    const response = await api.get<AuthorsListResponse>(`/authors`, {
      params: { lang },
    });
    return response.data;
  },

  async getAuthorById(
    authorId: number,
    lang: Language = "uk"
  ): Promise<AuthorDetailResponse> {
    const response = await api.get<AuthorDetailResponse>(
      `/authors/${authorId}`,
      {
        params: { lang },
      }
    );
    return response.data;
  },

  async getRandomAuthor(lang: Language = "uk"): Promise<AuthorRandomResponse> {
    const response = await api.get<AuthorRandomResponse>(`/authors/random`, {
      params: { lang },
    });
    return response.data;
  },
};

export default authorsService;
