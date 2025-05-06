"use client"

import { useLanguage } from "@/lib/language-context"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              {t('terms.title')}
            </h1>
            <p className="text-sm text-gray-500">
              {t('terms.lastUpdated')}
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-8">
                {t('terms.introduction')}
              </p>

              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.usage.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.usage.content')}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.accounts.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.accounts.content')}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.content.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.content.content')}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.prohibited.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.prohibited.content')}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.termination.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.termination.content')}
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('terms.sections.changes.title')}
                  </h2>
                  <p className="text-gray-700">
                    {t('terms.sections.changes.content')}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
