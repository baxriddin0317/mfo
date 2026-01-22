// app/services/homeService.ts
// import axios from "axios";

export type RatingCategory = {
  value: number;
  label: string;
};

export type CreditRange = {
  from: number;
  to: number;
  currency?: string;
  unit?: string;
  formatted: string;
};

export type CreditOffer = {
  title: string;
  amount: CreditRange;
  term: CreditRange;
  rate: {
    value: number;
    formatted: string;
  };
  real_annual_rate: CreditRange;
};

export type Mfo = {
  id: number;
  slug: string;
  name: string;
  h1_title: string;
  meta_title: string;
  meta_description: string;
  legal_entity: string;
  nbu_license: string;
  basic_characteristics_pdf_url: string;
  user_warning_pdf_url: string;
  rating_average: number;
  rating_count: number;
  rating_trust_score: number;
  position: number;
  ratings: {
    speed: RatingCategory;
    conditions: RatingCategory;
    support: RatingCategory;
    website: RatingCategory;
  };
  logo_url: string;
  basic_characteristics: string;
  user_warning: string;
  get_money_button_url: string;
  official_website: string;
  redirect_url: string;
  website_url: string;
  apply_url: string;
  is_active: boolean;
  credit_offers: {
    new_client: CreditOffer;
    repeat_client: CreditOffer;
  };
  quick_info: {
    amount_range: string;
    term_range: string;
    rate: string;
    rpc_range: string;
  };
  created_at: string;
  updated_at: string;
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
  is_reply?: boolean;
  mfo: {
    id: number;
    name: string;
    slug: string;
    logo_url: string;
  };
}

export interface HomeData {
  top_mfos: Mfo[];
  best_credits: Mfo[];
  recent_reviews: Review[];
  meta: Record<string, unknown>;
}

export type LangType = "ru" | "ua";

export const getHomeData = async (lang: LangType): Promise<HomeData> => {
  const apiLang = lang === "ua" ? "uk" : "ru";

  const res = await fetch(
    `https://api.mfoxa.com.ua/api/v1/home?lang=${apiLang}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!res.ok) {
    console.error("getHomeData error:", res.statusText);
    throw new Error("Failed to fetch home data");
  }

  const data: HomeData = await res.json();
  return data;
};
