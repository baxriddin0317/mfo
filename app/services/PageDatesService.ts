// import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

export interface PageDatesResponse {
  date_published: string; // ISO 8601
  date_modified: string; // ISO 8601
  type: string;
}

// export async function getPageDates(params: {
//   type:
//     | "home"
//     | "questions"
//     | "reviews"
//     | "catalog"
//     | "loans"
//     | "credits"
//     | "sitemap"
//     | "mfo"
//     | "promocodes"
//     | "about"
//     | "contacts";
//   mfo_id?: number;
//   mfo_slug?: string;
//   category?: string;
// }): Promise<PageDatesResponse> {
//   try {
//     const response = await axios.get<PageDatesResponse>(
//       `${API_URL}/api/v1/pages/dates`,
//       { params }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("getPageDates error:", error);
//     throw new Error("Failed to fetch page dates");
//   }
// }

export async function getPageDates(params: {
  type:
    | "home"
    | "questions"
    | "reviews"
    | "catalog"
    | "loans"
    | "credits"
    | "sitemap"
    | "mfo"
    | "promocodes"
    | "about"
    | "contacts";
  mfo_id?: number;
  mfo_slug?: string;
  category?: string;
}): Promise<PageDatesResponse> {
  const url = new URL(`${API_URL}/api/v1/pages/dates`);
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
    console.error("getPageDates error:", res.statusText);
    throw new Error("Failed to fetch page dates");
  }

  const data: PageDatesResponse = await res.json();
  return data;
}
