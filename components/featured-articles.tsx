import { ChevronRight, Star } from "lucide-react"
import Link from "next/link"

export function FeaturedArticles() {
  const articles = [
    {
      id: "add-multiple-files",
      title: "Como adicionar múltiplos arquivos a um projeto",
      url: "/ajuda/artigos/adicionar-multiplos-arquivos",
    },
    {
      id: "file-formats",
      title: "Quais formatos de arquivo são suportados?",
      url: "/ajuda/artigos/formatos-suportados",
    },
    {
      id: "free-plan-duration",
      title: "Por quanto tempo meu link ficará online no plano gratuito?",
      url: "/ajuda/artigos/duracao-plano-gratuito",
    },
    {
      id: "images-not-displaying",
      title: "As imagens do meu site não estão aparecendo",
      url: "/ajuda/artigos/imagens-nao-aparecem",
    },
    {
      id: "missing-content",
      title: "Algo está faltando no meu site",
      url: "/ajuda/artigos/conteudo-faltando",
    },
    {
      id: "custom-domain",
      title: "Como configurar um domínio personalizado",
      url: "/ajuda/artigos/dominio-personalizado",
    },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-[#0070F3]" />
        <h2 className="text-xl md:text-2xl font-bold text-[#333333]">Artigos em Destaque</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={article.url}
            className="p-5 bg-white rounded-xl border border-gray-100 hover:border-[#0070F3]/30 shadow-sm hover:shadow-md transition-all duration-300 flex justify-between items-center group"
          >
            <span className="text-[#333333] font-medium">{article.title}</span>
            <ChevronRight className="w-5 h-5 text-[#0070F3] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
          </Link>
        ))}
      </div>
    </div>
  )
}
