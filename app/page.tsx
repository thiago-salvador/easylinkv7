import { DotPattern } from "@/components/dot-pattern"
import { FileUpload } from "@/components/file-upload"
import { RotatingWords } from "@/components/rotating-words"
import { HowItWorks } from "@/components/how-it-works"
import { ForYouSection } from "@/components/for-you-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <DotPattern className="absolute inset-0 z-0 opacity-20" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 pt-20">
        <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center max-w-6xl">
          <div className="text-center mb-10 max-w-3xl mx-auto animate-fadeIn">
            <h1 className="text-3xl md:text-5xl font-bold text-[#333333] mb-4 tracking-tight leading-tight">
            A maneira mais simples de compartilhar seu trabalho
            </h1>
            <p className="text-lg text-[#777777] leading-relaxed">
              Publique seu site em segundos
            </p>
          </div>

          <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500">
            <div className="p-6">
              <div className="flex gap-2 mb-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="seu-link"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <button className="px-4 py-2.5 bg-[#F3F4F6] text-[#333333] border border-gray-200 rounded-lg flex items-center gap-1 hover:bg-gray-100 transition-colors">
                    .easylink.live
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mb-6 text-lg">
                <span className="text-[#333333] font-medium">Compartilhe</span>
                <RotatingWords />
              </div>

              <FileUpload />
            </div>

            <div className="text-xs text-center text-[#777777] p-4 border-t border-gray-100">
              Este site é protegido por reCAPTCHA e a Google
              <Link href="#" className="text-[#0070F3] hover:underline mx-1 font-medium">
                Política de Privacidade
              </Link>
              e
              <Link href="#" className="text-[#0070F3] hover:underline mx-1 font-medium">
                Termos de Serviço
              </Link>
              se aplicam.
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="como-funciona">
          <HowItWorks />
        </section>

        {/* For You Section */}
        <section id="para-voce">
          <ForYouSection />
        </section>

        {/* Features Section */}
        <section id="recursos">
          <FeaturesSection />
        </section>

        {/* Pricing Section */}
        <section id="precos">
          <PricingSection />
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <FaqSection />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
