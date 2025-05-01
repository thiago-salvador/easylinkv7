import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Página não encontrada</h2>
        <p className="text-gray-600 mb-6">O arquivo que você está procurando pode ter sido removido ou não existe.</p>
        <Button asChild>
          <Link href="/">Voltar para a página inicial</Link>
        </Button>
      </div>
    </div>
  )
}
