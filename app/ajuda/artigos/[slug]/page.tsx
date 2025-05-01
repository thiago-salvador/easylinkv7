import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DotPattern } from "@/components/dot-pattern"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

// Esta é uma página de exemplo para demonstrar a estrutura
// Em um cenário real, você buscaria o conteúdo do artigo de um CMS ou banco de dados
export default function ArticlePage({ params }: { params: { slug: string } }) {
  // Simulação de conteúdo de artigo
  const article = {
    title: "Como adicionar múltiplos arquivos a um projeto",
    content: `
      <p>O EasyLink permite que você faça upload de múltiplos arquivos para um único projeto de várias maneiras. Veja como:</p>
      
      <h2>Método 1: Upload de arquivo ZIP</h2>
      <p>A maneira mais simples de adicionar múltiplos arquivos é compactá-los em um arquivo ZIP e fazer o upload:</p>
      <ol>
        <li>Selecione todos os arquivos que deseja incluir no seu projeto</li>
        <li>Clique com o botão direito e escolha "Compactar" ou "Enviar para > Pasta compactada"</li>
        <li>No EasyLink, clique em "Enviar arquivo" e selecione o arquivo ZIP</li>
        <li>O EasyLink extrairá automaticamente o conteúdo e manterá a estrutura de pastas</li>
      </ol>
      
      <h2>Método 2: Arrastar e soltar múltiplos arquivos</h2>
      <p>Para projetos com poucos arquivos, você pode simplesmente arrastar e soltar todos eles de uma vez:</p>
      <ol>
        <li>Selecione todos os arquivos que deseja incluir</li>
        <li>Arraste-os para a área de upload do EasyLink</li>
        <li>Certifique-se de que seu arquivo principal seja chamado "index.html" se for um site</li>
      </ol>
      
      <h2>Método 3: Upload de pasta (apenas navegadores modernos)</h2>
      <p>Alguns navegadores modernos permitem o upload de pastas inteiras:</p>
      <ol>
        <li>Clique em "Enviar arquivo"</li>
        <li>Selecione "Escolher pasta" (se disponível no seu navegador)</li>
        <li>Selecione a pasta que contém todos os arquivos do seu projeto</li>
      </ol>
      
      <h2>Dicas importantes</h2>
      <ul>
        <li>Certifique-se de que seu arquivo principal seja chamado "index.html" para sites</li>
        <li>Mantenha os caminhos relativos corretos entre seus arquivos</li>
        <li>O limite de tamanho para upload varia de acordo com seu plano</li>
      </ul>
    `,
    updatedAt: "2023-11-15",
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      <DotPattern className="absolute inset-0 z-0 opacity-20" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 pt-20">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <Link href="/ajuda" className="inline-flex items-center text-[#0070F3] hover:underline mb-6 group">
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Voltar para Central de Ajuda
          </Link>

          <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-4">{article.title}</h1>
            <div className="text-sm text-[#777777] mb-6">Atualizado em {article.updatedAt}</div>

            <div className="prose max-w-none text-[#333333]" dangerouslySetInnerHTML={{ __html: article.content }} />

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-[#777777]">Este artigo foi útil?</p>
              <div className="flex gap-3 mt-2">
                <button className="px-4 py-2 bg-[#F3F4F6] text-[#333333] rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  👍 Sim
                </button>
                <button className="px-4 py-2 bg-[#F3F4F6] text-[#333333] rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  👎 Não
                </button>
              </div>
            </div>
          </article>

          <div className="mt-8 text-center">
            <p className="text-[#777777] mb-4">Ainda tem dúvidas?</p>
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
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
