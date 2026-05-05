"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useHistoryStore } from "@/store/historyStore"
import { averagesByType } from "@/lib/statistics"
import { cn } from "@/lib/utils"

export function AveragesByType() {
  const rolls = useHistoryStore((s) => s.rolls)
  const data = useMemo(() => averagesByType(rolls), [rolls])
  const t = useTranslations("stats")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("averagesByType")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((row) => {
          const diff = row.observed - row.theoretical
          return (
            <div key={row.type} className="flex items-center gap-3 font-mono text-sm">
              <span className="w-12 uppercase">{row.type}</span>
              <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                {row.count > 0 && (
                  <div
                    className="bg-primary h-full"
                    style={{
                      width: `${(row.observed / row.theoretical) * 50}%`,
                      maxWidth: "100%",
                    }}
                  />
                )}
              </div>
              <span
                className={cn(
                  "tabular-nums",
                  Math.abs(diff) > 0.5 && row.count > 20 && "text-amber-500",
                )}
              >
                {row.count > 0 ? row.observed.toFixed(2) : "—"}
              </span>
              <span className="text-muted-foreground tabular-nums">
                / {row.theoretical.toFixed(1)}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
