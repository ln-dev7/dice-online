import type { MetadataRoute } from "next"
import { LOCALES, routing } from "@/i18n/routing"

const BASE_URL = "https://lndev.me"
const ROUTES = ["", "/stats", "/presets", "/history", "/settings"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const route of ROUTES) {
    for (const locale of LOCALES) {
      const url = `${BASE_URL}/${locale}${route}`
      const languages = Object.fromEntries(
        LOCALES.map((l) => [l, `${BASE_URL}/${l}${route}`]),
      )
      entries.push({
        url,
        lastModified: now,
        changeFrequency: "weekly",
        priority: route === "" && locale === routing.defaultLocale ? 1 : 0.8,
        alternates: { languages },
      })
    }
  }

  return entries
}
