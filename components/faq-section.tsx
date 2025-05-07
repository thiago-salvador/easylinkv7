"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

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
  const { t } = useLanguage();
  
  const faqs: FaqItemProps[] = [
    {
      question: t('faq.questions.fileFormats.question'),
      answer: (
        <>
          <p>{t('faq.questions.fileFormats.answer.intro')}</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>{t('faq.questions.fileFormats.answer.items.html')}</li>
            <li>{t('faq.questions.fileFormats.answer.items.zip')}</li>
            <li>{t('faq.questions.fileFormats.answer.items.documents')}</li>
            <li>{t('faq.questions.fileFormats.answer.items.presentations')}</li>
          </ul>
          <p className="mt-2">{t('faq.questions.fileFormats.answer.conclusion')}</p>
        </>
      ),
      initialOpen: true,
    },
    {
      question: t('faq.questions.linkDuration.question'),
      answer: (
        <p>
          {t('faq.questions.linkDuration.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.wordpress.question'),
      answer: (
        <p>
          {t('faq.questions.wordpress.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.php.question'),
      answer: (
        <p>
          {t('faq.questions.php.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.publicAccess.question'),
      answer: (
        <p>
          {t('faq.questions.publicAccess.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.ecommerce.question'),
      answer: (
        <p>
          {t('faq.questions.ecommerce.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.support.question'),
      answer: (
        <p>
          {t('faq.questions.support.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.moneyBack.question'),
      answer: (
        <p>
          {t('faq.questions.moneyBack.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.cancel.question'),
      answer: (
        <p>
          {t('faq.questions.cancel.answer')}
        </p>
      ),
    },
    {
      question: t('faq.questions.afterCancel.question'),
      answer: (
        <p>
          {t('faq.questions.afterCancel.answer')}
        </p>
      ),
    },
  ]

  return (
    <section className="py-12 md:py-16 w-full">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10 animate-fadeIn">
          <h2 className="text-2xl md:text-4xl font-bold text-[#333333] mb-4 tracking-tight">{t('faq.title')}</h2>
          <p className="text-lg text-[#777777] max-w-2xl mx-auto leading-relaxed">
            {t('faq.subtitle')}
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
              {t('faq.notFound')}{" "}
              <a href="#" className="text-[#0070F3] font-medium hover:underline transition-colors">
                {t('faq.contactSupport')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
