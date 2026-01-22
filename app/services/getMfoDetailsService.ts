/* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from "axios";

export interface MfoRating {
  value: number;
  position: number;
  label: string;
}

export interface MfoCreditOffer {
  title: string;
  amount: {
    from: number;
    to: number;
    currency: string;
    formatted: string;
  };
  term: {
    from: number;
    to: number;
    unit: string;
    formatted: string;
  };
  rate: {
    value: number;
    formatted: string;
  };
  real_annual_rate: {
    from: number;
    to: number;
    formatted: string;
  };
}
export interface LoginPage {
  meta_title: string;
  meta_description: string;
  h1_title: string;
  content: string;
  published_at: string;
  updated_at: string;
  schema_markup: Record<string, any>;
}

export interface MfoCatalogOffer {
  id: number;
  client_type: "new" | "repeat";
  amount_from: number;
  amount_to: number;
  term_from: number;
  term_to: number;
  rate: number;
  real_annual_rate_from: number;
  real_annual_rate_to: number;
}

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

export interface MfoDetails {
  id: number;
  slug: string;
  name: string;
  h1_title: string;
  meta_title: string;
  meta_description: string;
  reviews_meta_title?: string;
  reviews_meta_description?: string;
  legal_entity: string;
  nbu_license: string;
  rating_average: number;
  rating_count: number;
  ratings: Record<string, MfoRating>;
  logo_url: string;
  apply_url: string;
  official_website: string;
  redirect_url: string;
  credit_offers: {
    new_client?: MfoCreditOffer;
    repeat_client?: MfoCreditOffer;
  };
  quick_info: {
    amount_range: string;
    term_range: string;
    rate: string;
    rpc_range: string;
  };
  tariffs: {
    min_amount: string;
    max_amount: string;
    name: string;
    id: number;
    term_days: number;
    max_term_days: number;
    min_term_days: number;
    rate: string;
    real_annual_rate: string;
  }[];
  catalog_offers: MfoCatalogOffer[];
  user_warning: string;
  basic_characteristics: string;
  basic_characteristics_pdf_url?: string;
  user_warning_pdf_url?: string;
  created_at: string;
  updated_at: string;
  login_page: LoginPage;
  recent_reviews?: Review[];

  [key: string]: any;
}

// export const getMfoDetails = async (
// 	slug: string,
// 	lang: "uk" | "ru" | "en" = "uk"
// ): Promise<MfoDetails> => {
// 	const response = await axios.get<MfoDetails>(
// 		`https://api.mfoxa.com.ua/api/v1/mfos/${slug}`,
// 		{
// 			params: {
// 				lang,
// 			},
// 		}
// 	);
// 	return response.data;
// };

export const getMfoDetails = async (
  slug: string,
  lang: "uk" | "ru" | "en" = "uk"
): Promise<MfoDetails> => {
  const res = await fetch(
    `https://api.mfoxa.com.ua/api/v1/mfos/${slug}?lang=${lang}`,
    {
      next: {
        revalidate: 60,
      },
    }
  );

  if (!res.ok) {
    const error = new Error(`Ошибка загрузки MFO: ${res.statusText}`) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  const data: MfoDetails = await res.json();

  return data;
};
