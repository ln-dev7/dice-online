import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { AppShell } from "@/components/layout/AppShell"
import { StatsOverview } from "@/components/stats/StatsOverview"
import { DistributionChart } from "@/components/stats/DistributionChart"
import { AveragesByType } from "@/components/stats/AveragesByType"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "stats" })
  return { title: t("title") }
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("stats")

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </header>
        <StatsOverview />
        <div className="grid gap-4 md:grid-cols-2">
          <DistributionChart />
          <AveragesByType />
        </div>
      </div>
    </AppShell>
  )
}
