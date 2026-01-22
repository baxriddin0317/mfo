// app/services/sitemapService.ts

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

export type SitemapEntry = {
  title: string;
  url: string;
  description: string;
  type: "mfo" | "catalog";
  rating?: number;
  rating_count?: number;
};

export type SitemapResponse = {
  categories: Record<string, SitemapEntry[]>;
};

const sitemapService = {
  async getSitemap(lang: "uk" | "ru"): Promise<SitemapResponse> {
    const response = await axios.get<SitemapResponse>(
      `${API_URL}/api/v1/sitemap/by-types`,
      {
        params: { lang },
      }
    );
    return response.data;
  },
};

export default sitemapService;
