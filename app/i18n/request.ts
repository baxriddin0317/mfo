import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Fallback на 'ua', якщо locale не визначено
  const effectiveLocale = locale || "ua";
  try {
    const messages = (await import(`../messages/${effectiveLocale}.json`))
      .default;
    return { messages, locale: effectiveLocale };
  } catch (error) {
    console.error(
      `Failed to load messages for locale ${effectiveLocale}:`,
      error
    );
    return {
      messages: (await import("../messages/ua.json")).default,
      locale: "ua",
    };
  }
});
