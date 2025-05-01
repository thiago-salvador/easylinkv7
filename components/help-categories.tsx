import { AlertCircle, HelpCircle, Globe, Video, FileText, Code, Shield, CreditCard } from "lucide-react"
import Link from "next/link"

export function HelpCategories() {
  const categories = [
    {
      id: "common-issues",
      title: "Problemas Comuns",
      icon: <AlertCircle className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#0070F3] to-[#0070F3]",
      url: "/ajuda/categorias/problemas-comuns",
    },
    {
      id: "faq",
      title: "Perguntas Frequentes",
      icon: <HelpCircle className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#9333EA] to-[#7C3AED]",
      url: "/ajuda/categorias/perguntas-frequentes",
    },
    {
      id: "custom-domains",
      title: "Domínios Personalizados",
      icon: <Globe className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]",
      url: "/ajuda/categorias/dominios-personalizados",
    },
    {
      id: "video-guides",
      title: "Guias em Vídeo",
      icon: <Video className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#10B981] to-[#34D399]",
      url: "/ajuda/categorias/guias-video",
    },
    {
      id: "file-management",
      title: "Gerenciamento de Arquivos",
      icon: <FileText className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#3B82F6] to-[#60A5FA]",
      url: "/ajuda/categorias/gerenciamento-arquivos",
    },
    {
      id: "developers",
      title: "Para Desenvolvedores",
      icon: <Code className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#EC4899] to-[#F472B6]",
      url: "/ajuda/categorias/desenvolvedores",
    },
    {
      id: "security",
      title: "Segurança e Privacidade",
      icon: <Shield className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#6366F1] to-[#818CF8]",
      url: "/ajuda/categorias/seguranca-privacidade",
    },
    {
      id: "billing",
      title: "Cobrança e Assinaturas",
      icon: <CreditCard className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-r from-[#EF4444] to-[#F87171]",
      url: "/ajuda/categorias/cobranca-assinaturas",
    },
  ]

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold text-[#333333] mb-6">Todas as Categorias</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.url}
            className="bg-white rounded-xl border border-gray-100 hover:border-[#0070F3]/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
          >
            <div className={`p-4 flex justify-center ${category.color}`}>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">{category.icon}</div>
            </div>
            <div className="p-4 text-center">
              <h3 className="font-medium text-[#333333] group-hover:text-[#0070F3] transition-colors">
                {category.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
