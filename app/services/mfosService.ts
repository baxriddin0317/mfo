// app/services/mfosService.ts
import { MfoDetails } from "./getMfoDetailsService";

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
export type Mfo = {
  id: number;
  catalog_offers: MfoCatalogOffer[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tariffs: any[];
  slug: string;
  name: string;
  h1_title: string;
  meta_title: string;
  meta_description: string;
  legal_entity: string;
  nbu_license: string;
  rating_average: number;
  rating_count: number;
  rating_position: number;
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
  questions_title: string;
  questions_description: string;
  questions_meta_title: string;
  questions_meta_description: string;
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

export type MfoParams = {
  page?: number;
  per_page?: number;
  lang?: "uk" | "ru" | "en";
  amount?: number;
  term?: number;
  rate_max?: number;
  rating_min?: number;
  sort?: "rating" | "amount_asc" | "amount_desc" | "rate_asc" | "rate_desc";
  catalog_page?: string;
  type?: "credit" | "loan";
};

export const getMFOs = async (
  params: MfoParams = {},
  retryCount = 0
): Promise<MfoDetails[]> => {
  const MAX_RETRIES = 2;
  const TIMEOUT_MS = 5000; // 3 секунд таймаут (Google botlar uchun optimallashtirildi)

  try {
    const url = new URL("https://api.mfoxa.com.ua/api/v1/mfos");
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });

    // Создаем AbortController для таймаута
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        next: {
          revalidate: 300, // 5 минут cache (60 soniyadan ko'proq)
          tags: ['mfos'], // Cache tag qo'shildi
        },
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        // Retry логика - agar 500+ xatolik bo'lsa va retry qilinmagan bo'lsa
        if (res.status >= 500 && retryCount < MAX_RETRIES) {
          console.warn(`MFO fetch failed with status ${res.status}, retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1))); // Exponential backoff
          return getMFOs(params, retryCount + 1);
        }
        throw new Error(`Failed to fetch MFO list: ${res.statusText}`);
      }

      const data: { data: MfoDetails[] } = await res.json();
      return data.data || []; 
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      // Retry логика - agar timeout yoki network xatolik bo'lsa
      if (retryCount < MAX_RETRIES) {
        const isTimeout = error instanceof Error && error.name === 'AbortError';
        const isNetworkError = error instanceof TypeError && error.message.includes('fetch');
        
        if (isTimeout || isNetworkError) {
          console.warn(`MFO fetch error (${error instanceof Error ? error.message : 'unknown'}), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1))); // Exponential backoff
          return getMFOs(params, retryCount + 1);
        }
      }
      
      console.error('All retries failed, returning empty array');
      return [];
    }
  } catch (error) {
    console.error("getMFOs error:", error);
    return [];
  }
};
