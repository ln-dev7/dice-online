"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Dices, BarChart3, Settings, History as HistoryIcon, Save } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useDiceRoll } from "@/hooks/useDiceRoll"
import { useRouter } from "@/i18n/navigation"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { roll } = useDiceRoll()
  const t = useTranslations("commandPalette")

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const navigate = (path: "/" | "/stats" | "/presets" | "/history" | "/settings") => {
    setOpen(false)
    router.push(path)
  }

  const quickRoll = (notation: string) => {
    setOpen(false)
    void roll({ notation })
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("title")}
      description={t("description")}
    >
      <CommandInput placeholder={t("placeholder")} />
      <CommandList>
        <CommandEmpty>{t("empty")}</CommandEmpty>
        <CommandGroup heading={t("groupQuickRolls")}>
          <CommandItem onSelect={() => quickRoll("1d20")}>
            <Dices /> 1d20
          </CommandItem>
          <CommandItem onSelect={() => quickRoll("2d6")}>
            <Dices /> 2d6
          </CommandItem>
          <CommandItem onSelect={() => quickRoll("4d6kh3")}>
            <Dices /> 4d6kh3
          </CommandItem>
          <CommandItem onSelect={() => quickRoll("1d100")}>
            <Dices /> 1d100
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading={t("groupNavigation")}>
          <CommandItem onSelect={() => navigate("/stats")}>
            <BarChart3 /> {t("openStats")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/presets")}>
            <Save /> Presets
          </CommandItem>
          <CommandItem onSelect={() => navigate("/history")}>
            <HistoryIcon /> {t("openHistory")}
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <Settings /> {t("openSettings")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
