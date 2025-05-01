"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  Paintbrush,
  Code,
  Home,
  Users,
  Utensils,
  BookOpen,
  Coins,
  GraduationCap,
  ChevronRight,
} from "lucide-react"

export function ForYouSection() {
  const [activeCategory, setActiveCategory] = useState("sales")

  const categories = [
    {
      id: "sales",
      name: "Vendas & Marketing",
      icon: (isActive: boolean) => <Briefcase className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Teste e compartilhe facilmente materiais de marketing para seu público",
      description: "Consigo fazer upload e compartilhar conteúdo sem precisar de uma equipe técnica.",
      author: "Paulo, Grupo Hapday",
      imageBg: "bg-gradient-to-b from-[#0070F3]/80 to-[#00C2AE]/80",
      images: ["/diverse-marketing-materials.png", "/modern-business-overview.png", "/modern-minimalist-catalog.png"],
    },
    {
      id: "designers",
      name: "Designers & Artistas",
      icon: (isActive: boolean) => <Paintbrush className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Compartilhe seu portfólio e trabalhos criativos com clientes potenciais",
      description: "O EasyLink me permite mostrar meus designs de forma profissional sem conhecimento técnico.",
      author: "Ana, Designer Freelancer",
      imageBg: "bg-gradient-to-b from-[#9333EA]/80 to-[#7C3AED]/80",
      images: ["/abstract-cloud-network.png", "/abstract-square-logo.png", "/abstract-network.png"],
    },
    {
      id: "developers",
      name: "Desenvolvedores",
      icon: (isActive: boolean) => <Code className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Demonstre protótipos e projetos web para clientes e colaboradores",
      description: "Consigo compartilhar meus projetos em desenvolvimento de forma rápida e segura.",
      author: "Carlos, Desenvolvedor Full-Stack",
      imageBg: "bg-gradient-to-b from-[#F59E0B]/80 to-[#FBBF24]/80",
      images: ["/veed-io-logo.png", "/abstract-network.png", "/abstract-cloud-network.png"],
    },
    {
      id: "realestate",
      name: "Imobiliárias",
      icon: (isActive: boolean) => <Home className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Crie apresentações de imóveis e compartilhe com potenciais compradores",
      description: "Nossos corretores conseguem criar páginas para cada imóvel em minutos.",
      author: "Márcia, Imobiliária Premium",
      imageBg: "bg-gradient-to-b from-[#10B981]/80 to-[#34D399]/80",
      images: ["/modern-business-overview.png", "/birds-in-nest.png", "/purple-left-arrow.png"],
    },
    {
      id: "recruitment",
      name: "Recrutamento",
      icon: (isActive: boolean) => <Users className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Compartilhe vagas e materiais de recrutamento com candidatos",
      description: "Simplificou nosso processo de compartilhamento de informações com candidatos.",
      author: "Roberto, RH Corporativo",
      imageBg: "bg-gradient-to-b from-[#EC4899]/80 to-[#F472B6]/80",
      images: ["/modern-minimalist-catalog.png", "/diverse-marketing-materials.png", "/abstract-square-logo.png"],
    },
    {
      id: "hospitality",
      name: "Hotelaria & Gastronomia",
      icon: (isActive: boolean) => <Utensils className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Crie cardápios digitais e materiais promocionais para seu restaurante",
      description: "Nossos clientes adoram escanear o QR code e ver nosso cardápio digital.",
      author: "Juliana, Restaurante Sabor & Arte",
      imageBg: "bg-gradient-to-b from-[#EF4444]/80 to-[#F87171]/80",
      images: ["/birds-in-nest.png", "/modern-business-overview.png", "/diverse-marketing-materials.png"],
    },
    {
      id: "elearning",
      name: "E-Learning & Publicações",
      icon: (isActive: boolean) => <BookOpen className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Distribua materiais educacionais e publicações para seus alunos",
      description: "Compartilhar materiais de curso nunca foi tão fácil e profissional.",
      author: "Fernando, Professor Universitário",
      imageBg: "bg-gradient-to-b from-[#3B82F6]/80 to-[#60A5FA]/80",
      images: ["/abstract-network.png", "/modern-minimalist-catalog.png", "/purple-left-arrow.png"],
    },
    {
      id: "crypto",
      name: "Crypto & Finanças",
      icon: (isActive: boolean) => <Coins className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Compartilhe whitepapers e apresentações de projetos financeiros",
      description: "A plataforma perfeita para distribuir documentação técnica com segurança.",
      author: "Marcelo, Consultor Blockchain",
      imageBg: "bg-gradient-to-b from-[#6366F1]/80 to-[#818CF8]/80",
      images: ["/abstract-square-logo.png", "/abstract-cloud-network.png", "/veed-io-logo.png"],
    },
    {
      id: "students",
      name: "Estudantes",
      icon: (isActive: boolean) => <GraduationCap className={`w-5 h-5 ${isActive ? "text-[#0070F3]" : "text-[#777777]"}`} />,
      title: "Compartilhe trabalhos acadêmicos e projetos com professores e colegas",
      description: "Uso o EasyLink para todos os meus trabalhos de faculdade. Super prático!",
      author: "Luísa, Estudante de Design",
      imageBg: "bg-gradient-to-b from-[#8B5CF6]/80 to-[#A78BFA]/80",
      images: ["/purple-left-arrow.png", "/abstract-network.png", "/birds-in-nest.png"],
    },
  ]

  const activeItem = categories.find((category) => category.id === activeCategory)

  return (
    <section className="py-12 md:py-16 w-full bg-gradient-to-b from-white to-[#F9FAFB]/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 items-center">
          <div className="animate-fadeInLeft">
            <h2 className="text-2xl md:text-4xl font-bold text-gradient mb-8 tracking-tight">
              Sim, o EasyLink
              <br />é para você
            </h2>

            <div className="space-y-1 pr-2">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer group hover:bg-[#F3F4F6] ${
                    category.id === activeCategory ? "bg-[#F3F4F6]" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg ${category.id === activeCategory ? "bg-[#0070F3]/10" : "bg-transparent"} flex items-center justify-center transition-colors group-hover:bg-[#0070F3]/10`}
                    >
                      {category.icon(category.id === activeCategory)}
                    </div>
                    <span
                      className={`font-medium ${category.id === activeCategory ? "text-[#0070F3]" : "text-[#333333]"} group-hover:text-[#0070F3] transition-colors`}
                    >
                      {category.name}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-all duration-300 ${
                      category.id === activeCategory
                        ? "text-[#0070F3] translate-x-0"
                        : "text-[#777777] -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 md:mt-0 animate-fadeInRight">
            {/* Container principal com relative e min-height */}
            <div className="relative bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-500 min-h-[700px]">
              {/* Bloco de Texto: Absolute em md+, stack em mobile */}
              <div className="relative md:absolute md:top-0 md:left-0 md:bottom-0 w-full md:w-1/2 flex flex-col justify-center items-start p-5 md:p-6 z-10">
                <h3 className="text-lg md:text-xl font-bold text-[#333333] mb-3 leading-tight">
                  {activeItem?.title}
                </h3>

                <Button className="mt-4 bg-black hover:bg-black/90 text-white rounded-full text-sm px-5 py-2 h-auto shadow-sm hover:shadow-md transition-all duration-300">
                  Ver exemplos aqui
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <div className="mt-8 border-l-4 border-[#0070F3] pl-4">
                  <p className="text-[#777777] italic mb-2 leading-relaxed text-sm">"{activeItem?.description}"</p>
                  <p className="text-sm font-medium">- {activeItem?.author}</p>
                </div>
              </div>

              {/* Bloco da Imagem: Absolute em md+, stack em mobile */}
              <div
                className={`relative md:absolute md:top-0 md:right-0 md:bottom-0 w-full md:w-1/2 ${activeItem?.imageBg} transition-all duration-500 min-h-[300px] md:min-h-0 overflow-hidden`} 
              >
                <img
                  src={activeItem?.images[0] || "/placeholder.svg"}
                  alt={`Exemplo para ${activeItem?.name}`}
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
