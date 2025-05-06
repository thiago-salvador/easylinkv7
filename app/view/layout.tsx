import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/language-context"
import Script from "next/script"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EasyLink Viewer",
  description: "Visualizador de arquivos EasyLink",
}

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <LanguageProvider>
            {/* Não incluímos o ConditionalHeader aqui */}
            <div className="flex flex-col min-h-screen">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
        <Script id="font-fix" strategy="afterInteractive">{`
          // Força o recarregamento das fontes se necessário
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
              document.body.classList.add('fonts-loaded');
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
