import Link from "next/link"
import { Logo } from "@/components/logo"
import { Twitter, Github, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Logo />
            <span className="text-xl font-bold text-[#333333]">EasyLink</span>
          </div>

          <div className="flex items-center gap-4 mb-6 md:mb-0">
            <Link
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#777777] hover:text-[#0070F3] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#777777] hover:text-[#0070F3] hover:bg-[#F3F4F6] transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#777777] hover:text-[#0070F3] hover:bg-[#F3F4F6] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </Link>
            <Link
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#777777] hover:text-[#0070F3] hover:bg-[#F3F4F6] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-[#777777] text-center md:text-left mb-6 md:mb-0 text-sm">
            © {new Date().getFullYear()} EasyLink - Todos os direitos reservados
          </div>

          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Produtos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Sobre
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Blog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Contato
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Privacidade
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="text-[#333333] hover:text-[#0070F3] transition-colors relative group text-sm">
              Termos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0070F3] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
