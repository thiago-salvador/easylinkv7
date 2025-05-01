"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function RotatingWords() {
  const words = ["Documentos", "Imagens", "Código", "Mais"]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
        setIsAnimating(false)
      }, 500) // Tempo da animação de saída
    }, 2000) // Troca a cada 2 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-7 min-w-[140px]">
      <span
        className={cn(
          "absolute left-0 text-gradient font-medium text-lg transition-all duration-500",
          isAnimating ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0",
        )}
      >
        {words[currentIndex]}
      </span>
    </div>
  )
}
