import { defineRouting } from "next-intl/routing"

export const LOCALES = [
  "en",
  "fr",
  "es",
  "de",
  "pt",
  "it",
  "zh",
  "ja",
  "ko",
  "ru",
  "ar",
  "hi",
] as const

export type Locale = (typeof LOCALES)[number]

export const RTL_LOCALES = new Set<Locale>(["ar"])

export const LOCALE_META: Record<
  Locale,
  { name: string; flag: string; dir: "ltr" | "rtl" }
> = {
  en: { name: "English", flag: "🇬🇧", dir: "ltr" },
  fr: { name: "Français", flag: "🇫🇷", dir: "ltr" },
  es: { name: "Español", flag: "🇪🇸", dir: "ltr" },
  de: { name: "Deutsch", flag: "🇩🇪", dir: "ltr" },
  pt: { name: "Português", flag: "🇵🇹", dir: "ltr" },
  it: { name: "Italiano", flag: "🇮🇹", dir: "ltr" },
  zh: { name: "中文", flag: "🇨🇳", dir: "ltr" },
  ja: { name: "日本語", flag: "🇯🇵", dir: "ltr" },
  ko: { name: "한국어", flag: "🇰🇷", dir: "ltr" },
  ru: { name: "Русский", flag: "🇷🇺", dir: "ltr" },
  ar: { name: "العربية", flag: "🇸🇦", dir: "rtl" },
  hi: { name: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
}

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "en",
  localePrefix: "always",
  // Toujours rediriger vers /en par défaut, on respecte ensuite le choix
  // utilisateur via le cookie NEXT_LOCALE positionné par le LanguageSwitcher.
  localeDetection: false,
})
