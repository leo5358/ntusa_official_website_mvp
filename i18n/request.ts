import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, locales } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  let locale: string | undefined;

  if (isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    // Try to detect from Accept-Language header
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage) {
      // Basic parsing: "en-US,en;q=0.9,zh-TW;q=0.8" -> ["en-US", "en", "zh-TW"]
      const preferredLocales = acceptLanguage
        .split(",")
        .map((part) => part.split(";")[0].trim());

      // 1. Direct match (e.g., "zh-TW" or "en")
      locale = preferredLocales.find((p) => locales.includes(p as (typeof locales)[number]));

      // 2. Language-only match (e.g., "en-US" -> "en")
      if (!locale) {
        locale = preferredLocales
          .map((p) => p.split("-")[0])
          .find((p) => locales.includes(p as (typeof locales)[number]));
      }
    }
  }

  if (!isLocale(locale)) {
    locale = defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
