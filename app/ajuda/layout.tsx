import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Central de Ajuda | EasyLink",
  description: "Encontre respostas para suas dúvidas sobre o EasyLink, tutoriais e guias de uso.",
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
