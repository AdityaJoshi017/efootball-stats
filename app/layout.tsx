import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { GoToTopButton } from "@/components/go-to-top-button"
import { ChatBot } from "@/components/chat-bot"
import "./globals.css"

import { Signika_Negative as V0_Font_Signika_Negative, Space_Mono as V0_Font_Space_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _signikaNegative = V0_Font_Signika_Negative({ subsets: ['latin'], weight: ["300","400","500","600","700"], variable: '--v0-font-signika-negative' })
const _spaceMono = V0_Font_Space_Mono({ subsets: ['latin'], weight: ["400","700"], variable: '--v0-font-space-mono' })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"], variable: '--v0-font-source-serif-4' })
const _v0_fontVariables = `${_signikaNegative.variable} ${_spaceMono.variable} ${_sourceSerif_4.variable}`

export const metadata: Metadata = {
  title: "eFootball Stats - By Aditya Joshi",
  description: "Compare football players, analyze performance data, and discover player statistics",
  // generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${_v0_fontVariables}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          {children}
          <GoToTopButton />
          <ChatBot />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
