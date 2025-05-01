"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { VerticalPDFViewer } from "@/components/vertical-pdf-viewer"
import { CleanPDFViewer } from "@/components/clean-pdf-viewer"

export default function SamplePage() {
  const [isPremium, setIsPremium] = useState(false)
  const [useSimulatedViewer, setUseSimulatedViewer] = useState(false)

  // URL de um PDF de exemplo mais confiável - PDF pequeno e simples
  const samplePdfUrl =
    "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf"

  return (
    <div className="h-screen flex flex-col">
      {/* Barra superior simples para navegação */}
      <div className="bg-white border-b p-2 flex justify-between items-center">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Voltar para a página inicial
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUseSimulatedViewer(!useSimulatedViewer)}
            className="text-xs"
          >
            {useSimulatedViewer ? "Usar Visualizador Real" : "Usar Visualizador Simulado"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPremium(!isPremium)} className="text-xs">
            {isPremium ? "Simular Usuário Free" : "Simular Usuário Premium"}
          </Button>
        </div>
      </div>

      {/* Visualizador de PDF com todas as páginas em sequência */}
      <div className="flex-1">
        {useSimulatedViewer ? (
          <CleanPDFViewer
            fileUrl={samplePdfUrl}
            fileName="documento-exemplo.pdf"
            isPremium={isPremium}
            totalPages={5}
          />
        ) : (
          <VerticalPDFViewer fileUrl={samplePdfUrl} fileName="documento-exemplo.pdf" isPremium={isPremium} />
        )}
      </div>
    </div>
  )
}
