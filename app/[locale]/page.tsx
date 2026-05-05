import { getTranslations, setRequestLocale } from "next-intl/server"
import { AppShell } from "@/components/layout/AppShell"
import { DiceRoller } from "@/components/dice/DiceRoller"
import { GameSystemTabs } from "@/components/dice/GameSystemTabs"
import { KeyboardShortcuts } from "@/components/layout/KeyboardShortcuts"

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("dice")
  const tCommon = await getTranslations("common")

  return (
    <AppShell>
      <KeyboardShortcuts />
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground text-sm">{tCommon("tagline")}</p>
        </header>
        <DiceRoller />
        <GameSystemTabs />
      </div>
    </AppShell>
  )
}
