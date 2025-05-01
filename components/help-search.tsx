"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"

export function HelpSearch() {
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar busca
    console.log("Searching for:", query)
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-[#0070F3]" />
          </div>
          <input
            type="search"
            className="w-full py-4 pl-12 pr-4 bg-white border-0 rounded-xl shadow-lg focus:ring-2 focus:ring-[#0070F3] outline-none text-[#333333] placeholder-[#777777]"
            placeholder="Buscar no centro de ajuda..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>
    </div>
  )
}
