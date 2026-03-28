"use client"
// src/components/ui/admin-order-actions.tsx
import { useState } from "react"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminOrderActions({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<"confirm" | "reject" | null>(null)
  const [note, setNote] = useState("")
  const [showNote, setShowNote] = useState(false)

  const handleAction = async (action: "confirm" | "reject") => {
    if (action === "reject" && !showNote) {
      setShowNote(true)
      return
    }

    setLoading(action)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, note }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || "Xatolik")
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2 shrink-0">
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Rad etish sababi (ixtiyoriy)"
          rows={2}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none w-48"
        />
      )}
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("confirm")}
          disabled={!!loading}
          className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-60"
        >
          {loading === "confirm" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle className="w-3.5 h-3.5" />
          )}
          Tasdiqlash
        </button>
        <button
          onClick={() => handleAction("reject")}
          disabled={!!loading}
          className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
        >
          {loading === "reject" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <XCircle className="w-3.5 h-3.5" />
          )}
          Rad etish
        </button>
      </div>
    </div>
  )
}
