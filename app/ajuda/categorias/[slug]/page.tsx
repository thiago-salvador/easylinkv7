import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DotPattern } from "@/components/dot-pattern"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Esta é uma página de exemplo para demonstrar a estrutura
// Em um cenário real, você buscaria o conteúdo da categoria de um CMS ou banco de dados
export default function CategoryPage({ params }: { params: { slug: string } }) {
  // Simulação de conteúdo da categoria
  const category = {
    title: "Problemas Comuns",
    description: "Soluções para os problemas mais frequentes encontrados pelos usuários do EasyLink.",
    articles: [
      {
        id: "images-not-displaying",
        title: "As imagens do meu site não estão aparecendo",
        excerpt: "Aprenda como resolver problemas com imagens que não carregam no seu site.",
        url: "/ajuda/artigos/imagens-nao-aparecem",
      },
      {
        id: "missing-content",
        title: "Algo está faltando no meu site",
        excerpt: "Verifique por que parte do conteúdo pode não estar aparecendo corretamente.",
        url: "/ajuda/artigos/conteudo-faltando",
      },
      {
        id: "css-not-loading",
        title: "Meu CSS não está sendo aplicado",
        excerpt: "Resolva problemas com estilos CSS que não estão funcionando no seu site.",
        url: "/ajuda/artigos/css-nao-carrega",
      },
      {
        id: "broken-links",
        title: "Links quebrados após o upload",
        excerpt: "Como corrigir links que não funcionam depois de fazer o upload do seu site.",
        url: "/ajuda/artigos/links-quebrados",
      },
      {
        id: "mobile-display-issues",
        title: "Problemas de exibição em dispositivos móveis",
        excerpt: "Dicas para resolver problemas de visualização em smartphones e tablets.",
        url: "/ajuda/artigos/problemas-mobile",
      },
      {
        id: "upload-errors",
        title: "Erros durante o upload de arquivos",
        excerpt: "Soluções para problemas comuns durante o processo de upload.",
        url: "/ajuda/artigos/erros-upload",
      },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <DotPattern className="absolute inset-0 z-0 opacity-20" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 pt-20">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Link href="/ajuda" className="inline-flex items-center text-[#0070F3] hover:underline mb-6 group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para Central de Ajuda
          </Link>

          <div className="mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-4">{category.title}</h1>
            <p className="text-[#777777] max-w-3xl">{category.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {category.articles.map((article) => (
              <Link
                key={article.id}
                href={article.url}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-[#0070F3]/30 hover:shadow-md transition-all duration-300 flex flex-col group"
              >
                <h2 className="text-lg font-medium text-[#333333] group-hover:text-[#0070F3] transition-colors mb-2">
                  {article.title}
                </h2>
                <p className="text-[#777777] text-sm mb-4 flex-grow">{article.excerpt}</p>
                <div className="flex items-center text-[#0070F3] text-sm font-medium">
                  Ler artigo
                  <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
