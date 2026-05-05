"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDiceStore } from "@/store/diceStore"
import { parseNotation, NotationError } from "@/lib/diceParser"
import { cn } from "@/lib/utils"

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
      if (e instanceof NotationError) setError(e.message)
      else setError(t("notationInvalid"))
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="notation">{t("notation")}</Label>
      <Input
        id="notation"
        value={notation}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("notationHint")}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn("font-mono", error && "border-destructive")}
        aria-invalid={!!error}
        aria-describedby={error ? "notation-error" : "notation-hint"}
      />
      {error ? (
        <p id="notation-error" className="text-destructive text-xs">
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
