import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { AppShell } from "@/components/layout/AppShell"
import { SoundSettings } from "@/components/settings/SoundSettings"
import { DiceCustomizer } from "@/components/settings/DiceCustomizer"
import { DataManagement } from "@/components/settings/DataManagement"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "settings" })
  return { title: t("title") }
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("settings")

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <DiceCustomizer />
          <SoundSettings />
        </div>

        <DataManagement />

        <Card>
          <CardHeader>
            <CardTitle>{t("fairDice")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              <Lock className="size-3" /> {t("fairDiceBadge")}
            </Badge>
            <p className="text-muted-foreground mt-3 text-sm">
              {t("fairDiceDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
