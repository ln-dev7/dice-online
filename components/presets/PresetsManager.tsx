"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Plus, Play, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { parseNotation } from "@/lib/diceParser"
import { notationErrorMessage } from "@/lib/notationErrorMessage"
import { usePresetsStore } from "@/store/presetsStore"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { NotationHelpDialog } from "@/components/dice/NotationHelpDialog"
import { cn } from "@/lib/utils"
import type { Preset } from "@/types/preset"

export function PresetsManager() {
  const presets = usePresetsStore((s) => s.presets)
  const addPreset = usePresetsStore((s) => s.addPreset)
  const removePreset = usePresetsStore((s) => s.removePreset)
  const { roll } = useDiceRoll()
  const t = useTranslations("presets")
  const tCommon = useTranslations("common")
  const tDice = useTranslations("dice")

  const [name, setName] = useState("")
  const [notation, setNotation] = useState("")
  const [tags, setTags] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)
  const [notationError, setNotationError] = useState<string | null>(null)

  // Validation à la volée du champ notation pour le feedback immédiat
  const onNotationChange = (value: string) => {
    setNotation(value)
    if (!value.trim()) {
      setNotationError(null)
      return
    }
    try {
      parseNotation(value)
      setNotationError(null)
    } catch (err) {
      setNotationError(notationErrorMessage(err, tDice))
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    if (!name.trim()) {
      setNameError(t("nameRequired"))
      valid = false
    } else {
      setNameError(null)
    }

    if (!notation.trim()) {
      setNotationError(tDice("errors.empty"))
      valid = false
    } else {
      try {
        parseNotation(notation)
        setNotationError(null)
      } catch (err) {
        setNotationError(notationErrorMessage(err, tDice))
        valid = false
      }
    }

    if (!valid) return

    addPreset({
      name: name.trim(),
      notation: notation.trim(),
      tags: tags
        .split(",")
        .map((tg) => tg.trim())
        .filter(Boolean),
    })
    setName("")
    setNotation("")
    setTags("")
    setNameError(null)
    setNotationError(null)
    toast.success(tCommon("save"))
  }

  // Lance le preset et affiche un toast avec le résultat (utile depuis /presets
  // car la tray principale n'est pas montée sur cette page).
  const playPreset = async (p: Preset) => {
    const result = await roll({
      notation: p.notation,
      label: p.name,
      mode: "normal",
    })
    if (!result) return
    const icon = result.isCritical ? "✨" : result.isFumble ? "💀" : "🎲"
    toast(`${icon} ${p.name} — ${result.total}`, {
      description: `${p.notation} → [${result.details
        .filter((d) => d.kept)
        .map((d) => d.value)
        .join(", ")}]${
        result.modifier !== 0
          ? ` ${result.modifier > 0 ? "+" : ""}${result.modifier}`
          : ""
      }`,
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t("create")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="p-name">{t("name")}</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (e.target.value.trim()) setNameError(null)
                }}
                placeholder={t("namePlaceholder")}
                aria-invalid={!!nameError}
                className={cn(nameError && "border-destructive")}
              />
              {nameError && (
                <p className="text-destructive text-xs">{nameError}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="p-notation">{t("notation")}</Label>
                <NotationHelpDialog />
              </div>
              <Input
                id="p-notation"
                value={notation}
                onChange={(e) => onNotationChange(e.target.value)}
                placeholder={t("notationPlaceholder")}
                className={cn(
                  "font-mono",
                  notationError && "border-destructive",
                )}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-invalid={!!notationError}
              />
              {notationError ? (
                <p className="text-destructive text-xs leading-snug">
                  {notationError}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">
                  {tDice("notationHint")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-tags">{t("tags")}</Label>
              <Input
                id="p-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("tagsPlaceholder")}
              />
            </div>
            <Button type="submit" className="w-full">
              <Plus className="size-4" /> {t("add")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {presets.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center text-sm">
              {t("noPresets")}
            </CardContent>
          </Card>
        ) : (
          presets
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((p) => (
              <Card key={p.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <code className="font-mono">{p.notation}</code>
                      {p.tags.map((tg) => (
                        <Badge
                          key={tg}
                          variant="outline"
                          className="text-[10px]"
                        >
                          <Tag className="size-2.5" />
                          {tg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => void playPreset(p)}>
                    <Play className="size-3.5" /> {t("play")}
                  </Button>
                  <DeletePresetDialog
                    preset={p}
                    onConfirm={() => removePreset(p.id)}
                  />
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}

function DeletePresetDialog({
  preset,
  onConfirm,
}: {
  preset: Preset
  onConfirm: () => void
}) {
  const t = useTranslations("presets")
  const tCommon = useTranslations("common")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={tCommon("delete")}>
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
          <DialogDescription>
            {t("deleteConfirmBody", { name: preset.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{tCommon("cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              {tCommon("delete")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

