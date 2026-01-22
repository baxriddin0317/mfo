export const routesMap: Record<string, string> = {
  about: "",
  reviews: "/reviews",
  promotion: "/promotion",
  login: "/login",
  qap: "/qap",
};

export const localePrefix = (locale: string): string =>
  locale === "ua" ? "" : `/${locale}`;
