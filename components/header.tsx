// components/header.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Menu, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from 'next/navigation' // Importa o hook para obter o caminho atual

// Interface para os links de navegação
interface NavLink {
  label: string;
  sectionId: string; // ID da seção na página inicial
}

const navLinks: NavLink[] = [
  { label: "Como Funciona", sectionId: "como-funciona" },
  { label: "Para Você", sectionId: "para-voce" },
  { label: "Recursos", sectionId: "recursos" },
  { label: "Preços", sectionId: "precos" },
  { label: "FAQ", sectionId: "faq" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname() // Obtém o caminho atual da URL

  const isHomePage = pathname === '/'; // Verifica se estamos na página inicial

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  // Efeito de scroll para o estilo do header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Função de scroll suave (usada apenas na página inicial)
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 80 // Ajuste conforme necessário
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    } else {
      console.warn(`Elemento com ID "${id}" não encontrado para scroll.`);
    }
  }

  // Função para renderizar um link de navegação (condicional)
  const renderNavLink = (link: NavLink, isMobile: boolean = false) => {
    const commonClasses = cn(
        "hover:text-[#0070F3] transition-colors text-sm font-medium relative group",
        isMobile ? "py-3 border-b border-gray-100 text-base flex items-center w-full text-left text-[#333333]" : "text-[#333333]"
    );

    if (isHomePage) {
      // Na Home: usa botão com scroll suave
      return (
        <button
          key={link.sectionId}
          onClick={() => scrollToSection(link.sectionId)}
          className={commonClasses}
        >
          {link.label}
          {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>}
        </button>
      );
    } else {
      // Em outras páginas: usa Link para navegar para Home + hash
      return (
        <Link
          key={link.sectionId}
          href={`/#${link.sectionId}`}
          onClick={() => setMobileMenuOpen(false)} // Fecha menu mobile ao clicar
          className={commonClasses}
        >
          {link.label}
           {!isMobile && <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>}
        </Link>
      );
    }
  };

  return (
    <header
      className={cn(
        "w-[calc(100%-8px)] mx-auto fixed left-0 right-0 top-3 bg-white/95 backdrop-blur-sm py-4 z-50 transition-all duration-300 rounded-xl",
        scrolled ? "shadow-md" : "shadow-sm",
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Lado Esquerdo: Logo e Navegação Desktop */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group" aria-label="EasyLink Home">
            <Logo className="transition-transform duration-300 group-hover:scale-110" />
            <span className="text-xl font-bold text-gradient">EasyLink</span>
          </Link>

          {/* Navegação Desktop - Usa a função renderNavLink */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => renderNavLink(link, false))}
          </nav>
        </div>

        {/* Lado Direito: Botões de Autenticação e Toggle Mobile */}
        <div className="flex items-center gap-3">
          {/* Botões de Autenticação Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" passHref legacyBehavior>
              <Button asChild variant="outline" className="rounded-full text-sm font-medium bg-black text-white border-black hover:bg-black/90 hover:text-white shadow-sm transition-all duration-300 hover:shadow-md">
                <a>Entrar</a>
              </Button>
            </Link>
            <Link href="/signup" passHref legacyBehavior>
               <Button asChild className="rounded-full text-sm font-medium bg-gradient-to-r from-[#0070F3] to-[#00C2AE] hover:shadow-button hover:shadow-[#0070F3]/20 transition-all duration-300 group shadow-sm">
                 <a>
                   Cadastre-se grátis
                   <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                 </a>
               </Button>
            </Link>
          </div>

          {/* Toggle do Menu Mobile */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#333333]" /> : <Menu className="w-6 h-6 text-[#333333]" />}
          </button>
        </div>
      </div>

      {/* Painel do Menu Mobile */}
      <div
        className={cn(
          "fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-sm shadow-lg z-40 transition-all duration-300 transform md:hidden",
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none",
        )}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setMobileMenuOpen(false); } }}
      >
        <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
          {/* Navegação Mobile - Usa a função renderNavLink */}
          {navLinks.map((link) => renderNavLink(link, true))}

          {/* Botões de Autenticação Mobile */}
          <div className="flex flex-col gap-3 mt-4">
             <Link href="/login" passHref legacyBehavior>
                <Button asChild variant="outline" className="w-full rounded-full text-sm font-medium bg-black text-white border-black hover:bg-black/90 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                  <a>Entrar</a>
                </Button>
             </Link>
             <Link href="/signup" passHref legacyBehavior>
                <Button asChild className="w-full rounded-full text-sm font-medium bg-gradient-to-r from-[#0070F3] to-[#00C2AE] hover:shadow-lg hover:shadow-[#0070F3]/20 transition-all duration-300 group" onClick={() => setMobileMenuOpen(false)}>
                  <a>
                    Cadastre-se grátis
                    <ArrowRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
             </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
