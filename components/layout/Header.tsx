"use client"

import { Dices } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Link, usePathname } from "@/i18n/navigation"
import { ThemeToggle } from "@/components/settings/ThemeToggle"
import { HistoryPanel } from "@/components/history/HistoryPanel"
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"

export function Header() {
  const pathname = usePathname()
  const t = useTranslations("nav")

  const NAV = [
    { href: "/", label: t("home") },
    { href: "/stats", label: t("stats") },
    { href: "/presets", label: t("presets") },
    { href: "/settings", label: t("settings") },
  ] as const

  return (
    <header className="bg-background/80 sticky top-0 z-30 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="from-primary to-primary/60 inline-flex size-7 items-center justify-center rounded-md bg-gradient-to-br text-primary-foreground">
            <Dices className="size-4" />
          </span>
          <span className="hidden sm:inline">Dice Online</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <HistoryPanel />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
