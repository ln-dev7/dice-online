"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useHistoryStore } from "@/store/historyStore"
import { distributionByType } from "@/lib/statistics"
import { DICE_TYPES, type DiceType } from "@/types/dice"

export function DistributionChart() {
  const rolls = useHistoryStore((s) => s.rolls)
  const [type, setType] = useState<DiceType>("d20")
  const t = useTranslations("stats")

  const data = useMemo(() => distributionByType(rolls, type), [rolls, type])
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{t("distribution")}</CardTitle>
        <Select value={type} onValueChange={(v) => setType(v as DiceType)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DICE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="text-muted-foreground py-12 text-center text-sm">
            {t("noDistributionData", { type })}
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="value" className="text-xs" />
                <YAxis className="text-xs" allowDecimals={false} />
                <RTooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
