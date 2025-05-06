"use client"

import Link from "next/link"
import { Logo } from "@/components/logo"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Logo />
            <span className="text-xl font-bold text-[#333333]">EasyLink</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#777777] text-center md:text-left mb-6 md:mb-0 text-sm">
            © {new Date().getFullYear()} EasyLink - {t('footer.allRightsReserved')}
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="/about" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              {t('footer.links.about')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              {t('footer.links.contact')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/terms" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              {t('footer.links.terms')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
