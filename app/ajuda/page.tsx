import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HelpSearch } from "@/components/help-search"
import { HelpCategories } from "@/components/help-categories"
import { FeaturedArticles } from "@/components/featured-articles"
import { DotPattern } from "@/components/dot-pattern"

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <DotPattern className="absolute inset-0 z-0 opacity-20" />
      
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#0070F3] to-[#00C2AE] py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Como podemos ajudar você?</h1>
            <HelpSearch />
          </div>
        </section>

        {/* Featured Articles */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <FeaturedArticles />
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 px-4 bg-[#F9FAFB]">
          <div className="container mx-auto max-w-5xl">
            <HelpCategories />
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-[#333333] mb-4">Não encontrou o que procurava?</h2>
            <p className="text-[#777777] mb-6">Nossa equipe de suporte está pronta para ajudar você com qualquer dúvida.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:suporte@easylink.live" 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#0070F3] to-[#00C2AE] text-white font-medium hover:shadow-lg hover:shadow-[#0070F3]/20 transition-all duration-300"
              >
                Enviar e-mail
              </a>
              <a 
                href="#" 
                className="px-6 py-3 rounded-full bg-black text-white font-medium hover:bg-black/90 transition-all duration-300"
              >
                Iniciar chat
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
