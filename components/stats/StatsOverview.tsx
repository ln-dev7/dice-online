"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useHistoryStore } from "@/store/historyStore"
import { summarize } from "@/lib/statistics"

export function StatsOverview() {
  const rolls = useHistoryStore((s) => s.rolls)
  const stats = useMemo(() => summarize(rolls), [rolls])
  const t = useTranslations("stats")

  const cards = [
    { label: t("totalRolls"), value: stats.totalRolls.toString() },
    { label: t("totalDice"), value: stats.totalDice.toString() },
    { label: t("averageResult"), value: stats.averageTotal.toFixed(1) },
    {
      label: t("criticalRate"),
      value: `${(stats.criticalRate * 100).toFixed(1)}%`,
      sub: stats.criticalCount.toString(),
    },
    {
      label: t("fumbleRate"),
      value: `${(stats.fumbleRate * 100).toFixed(1)}%`,
      sub: stats.fumbleCount.toString(),
    },
    { label: t("highestRoll"), value: stats.highestRoll.toString() },
    { label: t("lowestRoll"), value: stats.lowestRoll.toString() },
    { label: t("longestStreak"), value: stats.longestCritStreak.toString() },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-2xl font-bold tabular-nums">{c.value}</div>
            {c.sub && (
              <div className="text-muted-foreground mt-0.5 text-xs">{c.sub}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
