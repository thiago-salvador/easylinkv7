"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface FaqItemProps {
  question: string
  answer: React.ReactNode
  initialOpen?: boolean
}

function FaqItem({ question, answer, initialOpen = false }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex items-center justify-between w-full py-4 px-2 text-left focus:outline-none focus:ring-2 focus:ring-[#0070F3]/20 focus:rounded-lg transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-base font-medium text-[#333333] pr-8">{question}</h3>
        <ChevronDown
          className={cn("w-5 h-5 text-[#0070F3] transition-transform duration-300", isOpen && "transform rotate-180")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0",
        )}
      >
        <div className="text-[#777777] leading-relaxed text-sm px-2">{answer}</div>
      </div>
    </div>
  )
}

export function FaqSection() {
  const faqs: FaqItemProps[] = [
    {
      question: "Quais tipos de formatos de arquivo vocês suportam?",
      answer: (
        <>
          <p>O EasyLink suporta uma ampla variedade de formatos de arquivo, incluindo:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>HTML, CSS e JavaScript para sites estáticos</li>
            <li>Arquivos ZIP contendo seu site completo</li>
            <li>PDFs, imagens (JPG, PNG, GIF, SVG) e outros documentos</li>
            <li>Apresentações e arquivos de design</li>
          </ul>
          <p className="mt-2">Nossos planos pagos oferecem suporte para arquivos maiores e mais tipos de conteúdo.</p>
        </>
      ),
      initialOpen: true,
    },
    {
      question: "Por quanto tempo meu link ficará online no plano gratuito?",
      answer: (
        <p>
          No plano gratuito, seu link permanecerá ativo por 7 dias. Após esse período, ele será automaticamente
          desativado. Para manter seus links ativos por mais tempo, recomendamos fazer upgrade para um de nossos planos
          pagos, que oferecem armazenamento permanente enquanto sua assinatura estiver ativa.
        </p>
      ),
    },
    {
      question: "Vocês suportam WordPress ou CMS similares?",
      answer: (
        <p>
          O EasyLink é otimizado para hospedar sites estáticos, não oferecemos suporte para WordPress ou outros CMS que
          requerem PHP ou bancos de dados. No entanto, se você exportar seu site WordPress como HTML estático (usando
          plugins como Simply Static), poderá hospedar esse conteúdo em nossa plataforma sem problemas.
        </p>
      ),
    },
    {
      question: "Vocês suportam PHP?",
      answer: (
        <p>
          Não, atualmente o EasyLink não suporta PHP ou outras linguagens de servidor. Nossa plataforma é otimizada para
          conteúdo estático, incluindo HTML, CSS e JavaScript. Se você precisa de funcionalidades dinâmicas,
          recomendamos utilizar APIs e serviços serverless que podem ser integrados ao seu site estático.
        </p>
      ),
    },
    {
      question: "Meus links são acessíveis publicamente?",
      answer: (
        <p>
          Por padrão, todos os links do EasyLink são acessíveis publicamente através da URL gerada. No entanto, nos
          planos Solo e Pro, oferecemos a opção de proteger seus links com senha, permitindo que você controle quem pode
          acessar seu conteúdo. Você também pode optar por não listar seu conteúdo em mecanismos de busca.
        </p>
      ),
    },
    {
      question: "Vocês suportam sites de e-commerce?",
      answer: (
        <p>
          O EasyLink pode hospedar sites de e-commerce estáticos que utilizam serviços de terceiros para processamento
          de pagamentos, como Stripe, PayPal ou outras soluções de checkout. Você pode criar uma loja online usando
          frameworks como Next.js ou Gatsby com integrações de comércio headless como Shopify, Snipcart ou Commerce.js.
        </p>
      ),
    },
    {
      question: "Qual a maneira mais rápida de entrar em contato em caso de necessidade de ajuda?",
      answer: (
        <p>
          A maneira mais rápida de obter ajuda é através do nosso chat de suporte disponível no site, que funciona em
          horário comercial (9h às 18h, de segunda a sexta). Você também pode enviar um e-mail para
          suporte@easylink.live e responderemos em até 24 horas. Clientes dos planos Pro têm acesso a suporte
          prioritário com tempo de resposta garantido de 4 horas.
        </p>
      ),
    },
    {
      question: "Como funciona a garantia de devolução do dinheiro em 7 dias?",
      answer: (
        <p>
          Todos os nossos planos pagos vêm com uma garantia de devolução do dinheiro de 7 dias. Se você não estiver
          satisfeito com nosso serviço por qualquer motivo, basta entrar em contato com nossa equipe de suporte dentro
          de 7 dias após a compra, e processaremos o reembolso integral sem fazer perguntas. Observe que a garantia se
          aplica apenas à sua primeira assinatura, não a renovações.
        </p>
      ),
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: (
        <p>
          Sim, você pode cancelar sua assinatura a qualquer momento diretamente do seu painel de controle. Não há
          contratos de longo prazo ou taxas de cancelamento. Após o cancelamento, você continuará tendo acesso aos
          recursos do seu plano até o final do período de faturamento atual.
        </p>
      ),
    },
    {
      question: "O que acontece depois que eu cancelo?",
      answer: (
        <p>
          Após o cancelamento, sua conta permanecerá ativa até o final do período de faturamento atual. Depois disso,
          sua conta será rebaixada para o plano gratuito, e quaisquer recursos que excedam os limites do plano gratuito
          ficarão inacessíveis. Seus projetos permanecerão em nosso sistema por 30 dias após o término da assinatura,
          dando a você tempo para fazer backup do seu conteúdo ou reativar sua assinatura se mudar de ideia.
        </p>
      ),
    },
  ]

  return (
    <section className="py-12 md:py-16 w-full">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 animate-fadeIn">
          <h2 className="text-2xl md:text-4xl font-bold text-[#333333] mb-4 tracking-tight">Perguntas Frequentes</h2>
          <p className="text-lg text-[#777777] max-w-2xl mx-auto leading-relaxed">
            Encontre respostas para as dúvidas mais comuns sobre o EasyLink
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fadeInUp">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500">
            <div className="divide-y divide-gray-200 p-6">
              {faqs.map((faq, index) => (
                <FaqItem key={index} question={faq.question} answer={faq.answer} initialOpen={faq.initialOpen} />
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-[#777777]">
              Não encontrou o que procurava?{" "}
              <a href="#" className="text-[#0070F3] font-medium hover:underline transition-colors">
                Entre em contato com nosso suporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
