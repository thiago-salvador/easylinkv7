"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Edit3, Lock, QrCode, ArrowRight, Image as ImageIcon, ToggleLeft } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const featuresData = [
  {
    id: "email",
    title: "Capture emails",
    icon: <Mail className="w-7 h-7 text-white" />,
    mockup: (
      <div className="w-full max-w-xs">
        <div className="relative mb-4">
          <input
            type="email"
            readOnly
            placeholder="Digite seu email"
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:outline-none transition-all cursor-default"
          />
        </div>
        <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#0070F3] to-[#00C2AE] text-white font-medium transition-all duration-300 group relative overflow-hidden cursor-default">
          <span className="relative z-10">Continuar</span>
        </button>
      </div>
    ),
  },
  {
    id: "edit",
    title: "Faça edições",
    icon: <Edit3 className="w-7 h-7 text-white" />,
    mockup: (
      <div className="w-full max-w-xs flex flex-col items-center">
        <p className="text-white/80 text-center mb-4 text-sm">Edite seu conteúdo visualmente.</p>
        <div className="w-full h-20 bg-white/10 rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/50" />
        </div>
        <button className="mt-4 w-1/2 py-2 rounded-lg bg-gradient-to-r from-[#00C2AE] to-[#00C2AE]/80 text-white font-medium text-sm cursor-default">
          Salvar
        </button>
      </div>
    ),
  },
  {
    id: "password",
    title: "Proteção com senha",
    icon: <Lock className="w-7 h-7 text-white" />,
    mockup: (
      <div className="w-full max-w-xs flex flex-col items-center">
         <p className="text-white/80 text-center mb-4 text-sm">Ative a proteção por senha.</p>
        <div className="flex items-center justify-between w-full bg-white/5 p-3 rounded-lg mb-4">
            <span className="text-white">Proteger com senha</span>
            <ToggleLeft className="w-10 h-6 text-white/50" />
        </div>
        <input
            type="password"
            readOnly
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/50 focus:outline-none transition-all cursor-default"
          />
      </div>
    ),
  },
  {
    id: "qr",
    title: "Gere códigos QR",
    icon: <QrCode className="w-7 h-7 text-white" />,
    mockup: (
      <div className="w-full max-w-xs flex flex-col items-center">
        <p className="text-white/80 text-center mb-4 text-sm">Compartilhe com um QR Code.</p>
        <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-1">
            {/* Placeholder for QR Code Image */}
            <QrCode className="w-20 h-20 text-[#1E293B]" /> 
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  const { t } = useLanguage();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureIndex((prevIndex) => (prevIndex + 1) % featuresData.length);
    }, 4000); // Mudar a cada 4 segundos

    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(interval);
  }, []); // Executar apenas uma vez na montagem

  const activeFeature = featuresData[activeFeatureIndex];

  return (
    <section className="py-12 md:py-16 w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12 animate-fadeIn">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 tracking-tight">
            <span className="text-[#333333]">{t('features.title.part1')}</span>
            <br />
            <span className="text-gradient">{t('features.title.part2')}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="group animate-fadeInLeft" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-[#F3F4F6] hover:shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#0070F3]/10 flex items-center justify-center group-hover:bg-[#0070F3]/20 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#0070F3]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#0070F3] transition-colors">
                    {t('features.cards.email.title')}
                  </h3>
                  <p className="text-[#777777] mb-3 leading-relaxed text-sm">
                    {t('features.cards.email.description')}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#0070F3] font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-sm"
                  >
                    {t('features.learnMore')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="group animate-fadeInLeft" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-[#F3F4F6] hover:shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#00C2AE]/10 flex items-center justify-center group-hover:bg-[#00C2AE]/20 transition-colors flex-shrink-0">
                  <Edit3 className="w-5 h-5 text-[#00C2AE]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#00C2AE] transition-colors">
                    {t('features.cards.edit.title')}
                  </h3>
                  <p className="text-[#777777] mb-3 leading-relaxed text-sm">
                    {t('features.cards.edit.description')}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#00C2AE] font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-sm"
                  >
                    {t('features.learnMore')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="group animate-fadeInLeft" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-[#F3F4F6] hover:shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#0070F3]/10 flex items-center justify-center group-hover:bg-[#0070F3]/20 transition-colors flex-shrink-0">
                  <Lock className="w-5 h-5 text-[#0070F3]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#0070F3] transition-colors">
                    {t('features.cards.password.title')}
                  </h3>
                  <p className="text-[#777777] mb-3 leading-relaxed text-sm">
                    {t('features.cards.password.description')}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#0070F3] font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-sm"
                  >
                    {t('features.learnMore')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="group animate-fadeInLeft" style={{ animationDelay: "0.4s" }}>
              <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-[#F3F4F6] hover:shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-[#00C2AE]/10 flex items-center justify-center group-hover:bg-[#00C2AE]/20 transition-colors flex-shrink-0">
                  <QrCode className="w-5 h-5 text-[#00C2AE]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#333333] mb-2 group-hover:text-[#00C2AE] transition-colors">
                    {t('features.cards.qr.title')}
                  </h3>
                  <p className="text-[#777777] mb-3 leading-relaxed text-sm">
                    {t('features.cards.qr.description')}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-[#00C2AE] font-medium flex items-center gap-1 group-hover:gap-2 transition-all text-sm"
                  >
                    {t('features.learnMore')} <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 md:mt-0 animate-fadeInRight">
            <div className="relative z-10 bg-white rounded-2xl shadow-card overflow-hidden p-5 md:p-6">
              <div className="relative bg-[#1E293B] rounded-xl p-5 flex flex-col items-center min-h-[250px] justify-center transition-all duration-500">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-5 animate-pulse-subtle">
                  {activeFeature.icon}
                </div>
                
                {activeFeature.mockup}
                
              </div>

              <div className="mt-5 flex justify-center items-center gap-2">
                {featuresData.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === activeFeatureIndex ? 'bg-[#0070F3]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}
