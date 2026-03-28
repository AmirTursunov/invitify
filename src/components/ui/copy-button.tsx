"use client"
// src/components/ui/copy-button.tsx
import { useState } from "react"
import { Copy, Check } from "lucide-react"

export default function CopyButton({ text, label = "Nusxalash" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" /> Nusxalandi!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" /> {label}
        </>
      )}
    </button>
  )
}
