/**
 * Generates hreflang alternates and canonical URL for a given path
 * @param pathSegments - Array of path segments (e.g., ["mfo", "company-name"] or ["kredit-pid-0"])
 * @param lang - Current language ("ua" or "ru")
 * @returns Metadata alternates object
 */
export function generateAlternates(
  pathSegments: string[],
  lang: string
): {
  canonical: string;
  languages: {
    "uk-UA": string;
    "ru-UA": string;
    "x-default": string;
  };
} {
  const baseUrl = "https://mfoxa.com.ua";
  
  // Build path from segments
  const path = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
  
  // Ukrainian version (default, no prefix)
  const ukUrl = `${baseUrl}${path}`;
  
  // Russian version (with /ru prefix)
  const ruUrl = `${baseUrl}/ru${path}`;
  
  // Canonical URL based on current language
  const canonical = lang === "ua" ? ukUrl : ruUrl;
  
  return {
    canonical,
    languages: {
      "uk-UA": ukUrl,
      "ru-UA": ruUrl,
      "x-default": ukUrl, // Default to Ukrainian
    },
  };
}

