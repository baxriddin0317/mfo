import axios from "axios";

// Базовый URL из .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.mfoxa.com.ua";

// Типы
export type Language = "uk" | "ru" | "en";

export type SettingsGroup =
  | "general"
  | "seo"
  | "contacts"
  | "social"
  | "appearance"
  | "loan_page"
  | "mfo_page"
  | "reviews_page"
  | "about_page"
  | "sitemap_page"
  | "contacts_page";

export interface SiteSettingsResponse {
  settings: Record<string, string>;
}

export interface SettingItem {
  key: string;
  value: string;
  type: string;
}

export interface SingleSettingResponse {
  key: string;
  value: string;
  type: string;
}

export interface SettingsGroupResponse {
  group: string;
  language: Language;
  count: number;
  settings: Record<string, string>;
}

export interface SettingsGroupsListResponse {
  groups: {
    name: string;
    count: number;
  }[];
}

export interface ErrorResponse {
  message: string;
}

// Базовая конфигурация axios
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    Accept: "application/json",
  },
});

// Сервис настроек
const settingsService = {
  async getAllSettings(
    group?: SettingsGroup,
    lang: Language = "uk"
  ): Promise<SiteSettingsResponse> {
    const response = await api.get<SiteSettingsResponse>(`/settings`, {
      params: { group, lang },
    });
    return response.data;
  },

  async getSettingByKey(
    key: string,
    lang: Language = "uk"
  ): Promise<SingleSettingResponse> {
    const response = await api.get<SingleSettingResponse>(`/settings/${key}`, {
      params: { lang },
    });
    return response.data;
  },

  async getGroupsList(): Promise<SettingsGroupsListResponse> {
    const response = await api.get<SettingsGroupsListResponse>(
      `/settings/groups`
    );
    return response.data;
  },

  async getSettingsByGroup(
    group: SettingsGroup,
    lang: Language = "uk"
  ): Promise<SettingsGroupResponse> {
    const response = await api.get<SettingsGroupResponse>(
      `/settings/group/${group}`,
      {
        params: { lang },
      }
    );
    return response.data;
  },
};

export default settingsService;
