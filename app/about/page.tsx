"use client"

import { useLanguage } from "@/lib/language-context"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              {t('about.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="prose prose-lg max-w-none mb-16">
            <p className="text-gray-700 mb-8">
              {t('about.description')}
            </p>

            <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('about.mission')}
              </h2>
              <p className="text-gray-700">
                {t('about.missionText')}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('about.team')}
              </h2>
              <p className="text-gray-700">
                {t('about.teamText')}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
