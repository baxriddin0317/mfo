/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { MfoDetails } from "./getMfoDetailsService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

// Тип для элемента каталога
export interface CatalogPage {
  id: number;
  slug: string;
  type: "credit" | "loan" | string;
  button_name: string;
  meta_title: string;
  color: string;
  meta_description: string;
  h1_title: string;
  description_under_title: string;
  seo_text: string;
  sort_order: number;
}

// Ответ от /api/v1/catalog
export interface GetCatalogListResponse {
  data: CatalogPage[];
  message: string;
}
export interface CatalogPageFull {
  id: number;
  slug: string;
  type: "credit" | "loan" | string;
  button_name: string;
  meta_title: string;
  meta_description: string;
  h1_title: string;
  description_under_title: string;
  seo_text: string;
  faqs: FaqItem[]; // если FAQ — список вопросов-ответов
  fast_links: FastLink[]; // если есть ссылки на другие страницы или блоки
}

export interface FaqItem {
  question: string;
  answer: string;
  id: number;
}

export interface FastLink {
  id: number;
  name: string;
  url: string;
  color: string;
  sort_order: number;
}
// Ответ от /api/v1/catalog/{slug}
export interface GetCatalogBySlugResponse {
  data: {
    mfo_list: any[]; // можно заменить на конкретный тип, если знаешь структуру MFO
    catalog: CatalogPage;
  };
  message: string;
  page: CatalogPageFull;
  mfos: MfoDetails[];
}

interface GetCatalogParams {
  lang?: "uk" | "ru" | "en";
  type?: "credit" | "loan";
}

interface GetCatalogBySlugParams {
  slug: string;
  lang?: "uk" | "ru" | "en";
  page?: number;
}

export const catalogService = {
  async getAll(params?: GetCatalogParams): Promise<GetCatalogListResponse> {
    const response = await axios.get<GetCatalogListResponse>(
      `${API_URL}/api/v1/catalog`,
      { params }
    );
    return response.data;
  },

  async getBySlug({
    slug,
    lang,
    isLoan = true,
  }: GetCatalogBySlugParams & {
    isLoan?: boolean;
  }): Promise<GetCatalogBySlugResponse> {
    const path = isLoan ? `catalog/loan/${slug}` : `catalog/${slug}`;

    const response = await axios.get<GetCatalogBySlugResponse>(
      `${API_URL}/api/v1/${path}`,
      { params: { lang } }
    );

    return response.data;
  },
};
