import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations, setRequestLocale } from "next-intl/server"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { LOCALE_META, LOCALES, routing, type Locale } from "@/i18n/routing"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: "meta" })
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, `/${l}`]),
  ) as Record<string, string>
  return {
    metadataBase: new URL("https://lndev.me"),
    title: {
      default: t("title"),
      template: `%s · ${t("appName")}`,
    },
    description: t("description"),
    keywords: t("keywords"),
    authors: [{ name: "Leonel Ngoya", url: "https://lndev.me" }],
    creator: "Leonel Ngoya",
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `/${locale}`,
      siteName: t("appName"),
      locale,
      alternateLocale: LOCALES.filter((l) => l !== locale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      creator: "@ln_dev7",
    },
    icons: { icon: "/favicon.ico" },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b12" },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const dir = LOCALE_META[locale as Locale].dir

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body>
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
