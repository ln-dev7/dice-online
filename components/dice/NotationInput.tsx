"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDiceStore } from "@/store/diceStore"
import { parseNotation } from "@/lib/diceParser"
import { notationErrorMessage } from "@/lib/notationErrorMessage"
import { cn } from "@/lib/utils"
import { NotationHelpDialog } from "@/components/dice/NotationHelpDialog"

export function NotationInput() {
  const notation = useDiceStore((s) => s.notation)
  const setNotation = useDiceStore((s) => s.setNotation)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("dice")

  const onChange = (value: string) => {
    setNotation(value)
    if (!value.trim()) {
      setError(null)
      return
    }
    try {
      parseNotation(value)
      setError(null)
    } catch (e) {
      setError(notationErrorMessage(e, t))
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="notation">{t("notation")}</Label>
      <div className="flex gap-2">
        <Input
          id="notation"
          value={notation}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("notationHint")}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={cn("flex-1 font-mono", error && "border-destructive")}
          aria-invalid={!!error}
          aria-describedby={error ? "notation-error" : "notation-hint"}
        />
        <NotationHelpDialog />
      </div>
      {error ? (
        <p id="notation-error" className="text-destructive text-xs leading-snug">
          {error}
        </p>
      ) : (
        <p id="notation-hint" className="text-muted-foreground text-xs">
          {t("notationHint")}
        </p>
      )}
    </div>
  )
}
