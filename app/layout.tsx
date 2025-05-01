import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ConditionalHeader } from "@/components/conditional-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EasyLink",
  description: "Faça upload, compartilhe e publique seus arquivos em segundos",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ConditionalHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
