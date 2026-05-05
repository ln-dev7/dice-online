import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { AppShell } from "@/components/layout/AppShell"
import { HistoryFullList } from "@/components/history/HistoryFullList"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "history" })
  return { title: t("title") }
}

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("history")

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </header>
        <HistoryFullList />
      </div>
    </AppShell>
  )
}
