import axios from "axios";

const API_BASE = `${
  process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua"
}/api/v1/page-links`;

export type Link = {
  id: number;
  title: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  category?: string; // в категории может быть
};

export type Category = {
  id: number;
  title: string;
  links: Link[];
};

export type PageLinksResponse = {
  data: Category[];
  meta: {
    language: "uk" | "ru";
    total_categories: number;
    total_links: number;
    generated_at: string;
  };
};

export type CategoryLinksResponse = {
  data: Category;
};

export async function fetchPageLinks(
  lang: "uk" | "ru" = "uk",
  active_only: boolean = true
): Promise<PageLinksResponse> {
  const response = await axios.get<PageLinksResponse>(API_BASE, {
    params: { lang, active_only },
  });
  return response.data;
}

export async function fetchCategoryLinks(
  categoryId: number,
  lang: "uk" | "ru" = "uk",
  active_only: boolean = true
): Promise<CategoryLinksResponse> {
  const response = await axios.get<CategoryLinksResponse>(
    `${API_BASE}/${categoryId}`,
    { params: { lang, active_only } }
  );
  return response.data;
}
