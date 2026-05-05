import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { AppShell } from "@/components/layout/AppShell"
import { PresetsManager } from "@/components/presets/PresetsManager"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "presets" })
  return { title: t("title") }
}

export default async function PresetsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("presets")

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </header>
        <PresetsManager />
      </div>
    </AppShell>
  )
}
