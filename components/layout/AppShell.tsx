"use client"

import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { CommandPalette } from "@/components/layout/CommandPalette"
import { Toaster } from "@/components/ui/sonner"
import { useReducedMotionSync } from "@/hooks/useReducedMotion"

export function AppShell({ children }: { children: React.ReactNode }) {
  useReducedMotionSync()
  return (
    <div className="bg-background text-foreground flex min-h-svh flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
      <Footer />
      <CommandPalette />
      <Toaster position="bottom-right" />
    </div>
  )
}
