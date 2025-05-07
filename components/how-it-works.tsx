// components/how-it-works.tsx

"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function HowItWorks() {
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16 w-full max-w-5xl mx-auto px-4">
      {/* Título e Botão */}
      <div className="text-center mb-10 animate-fadeIn">
        <p className="text-[#777777] mb-2 font-medium">{t('howItWorks.tagline')}</p>
        <h2 className="text-2xl md:text-4xl font-bold text-[#333333] mb-6 tracking-tight">
          {t('howItWorks.title')}
        </h2>
        <Button className="rounded-full text-sm font-medium bg-gradient-to-r from-[#0070F3] to-[#00C2AE] hover:shadow-button transition-all duration-300 group px-6 py-2 h-auto">
          {t('howItWorks.tryFree')}
          <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Grid: Passos à esquerda, Vídeo à direita */}
      <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 items-center mt-12">
        {/* Coluna dos Passos */}
        <div className="relative">
          <div className="absolute left-[28px] top-[70px] bottom-[70px] w-[2px] bg-gradient-to-b from-[#0070F3] to-[#00C2AE] hidden sm:block rounded-full"></div>
          {/* Passo 1 */}
          <div className="relative z-10 mb-10 md:mb-12 group animate-fadeInLeft">
             <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0070F3] to-[#00C2AE] flex items-center justify-center text-white font-bold text-xl mr-5 shadow-lg shadow-[#0070F3]/20 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">{t('howItWorks.steps.1.title')}</h3>
                <p className="text-[#777777] leading-relaxed">
                  {t('howItWorks.steps.1.description')}
                </p>
              </div>
            </div>
          </div>
          {/* Passo 2 */}
          <div className="relative z-10 mb-10 md:mb-12 group animate-fadeInLeft" style={{ animationDelay: "0.2s" }}>
             <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0070F3] to-[#00C2AE] flex items-center justify-center text-white font-bold text-xl mr-5 shadow-lg shadow-[#0070F3]/20 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">{t('howItWorks.steps.2.title')}</h3>
                <p className="text-[#777777] leading-relaxed">
                  {t('howItWorks.steps.2.description')}
                </p>
              </div>
            </div>
          </div>
          {/* Passo 3 */}
          <div className="relative z-10 group animate-fadeInLeft" style={{ animationDelay: "0.4s" }}>
             <div className="flex items-start">
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#0070F3] to-[#00C2AE] flex items-center justify-center text-white font-bold text-xl mr-5 shadow-lg shadow-[#0070F3]/20 transition-transform group-hover:scale-110 duration-300 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#333333] mb-2">{t('howItWorks.steps.3.title')}</h3>
                <p className="text-[#777777] leading-relaxed">
                  {t('howItWorks.steps.3.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna do Vídeo */}
        <div className="relative mt-8 md:mt-0 animate-fadeInRight">
          {/* --- Tag <video> com autoplay, loop, muted, playsInline e sem controls --- */}
          <video
            src="/flow-vid.mov" // Certifique-se que este caminho está correto
            width="600"
            height="400"
            autoPlay // Adicionado para autoplay
            loop // Adicionado para loop
            muted // Adicionado (NECESSÁRIO para autoplay na maioria dos navegadores)
            playsInline // Adicionado para melhor compatibilidade móvel
            // controls // REMOVIDO para esconder controles padrão
            className="w-full h-auto rounded-xl shadow-card"
            preload="metadata"
            // poster="/images/video-poster.jpg" // Opcional: Imagem de pré-visualização
          >
            {/* Fallback */}
            {t('howItWorks.videoFallback')}
            {/* Adicione sources para outros formatos se necessário */}
            {/* <source src="/flow-vid.webm" type="video/webm"> */}
            {/* <source src="/flow-vid.mp4" type="video/mp4"> */}
          </video>
           {/* Elemento decorativo */}
           <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#F3F4F6] rounded-full flex items-center justify-center rotate-12 hidden md:flex animate-float-slow">
             <div className="text-xs font-bold text-center text-[#333333] -rotate-12">
               <div className="text-[10px] uppercase">{t('howItWorks.badge.readyIn')}</div>
               <div className="text-lg text-[#0070F3]">3</div>
               <div className="text-[10px]">{t('howItWorks.badge.steps')}</div>
             </div>
           </div>
        </div>
      </div>
    </section>
  )
}
