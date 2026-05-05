"use client"

import { useTranslations } from "next-intl"
import { Github, Heart } from "lucide-react"

const REPO_URL = "https://github.com/ln-dev7/dice-online"

export function Footer() {
  const t = useTranslations("footer")
  return (
    <footer className="border-t py-6">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm sm:flex-row">
        <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
          <span>{t("madeBy").replace("❤️", "").trim()}</span>
          <Heart className="size-3.5 fill-red-500 text-red-500" aria-hidden />
          <a
            href="https://lndev.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Leonel Ngoya
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
            aria-label="GitHub repository"
          >
            <Github className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <p>{t("copyright")}</p>
        </div>
      </div>
    </footer>
  )
}
