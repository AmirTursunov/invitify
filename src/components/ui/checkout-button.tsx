"use client"
// src/components/ui/checkout-button.tsx
import { useState } from "react"
import { ShoppingCart, Loader2, CheckCircle } from "lucide-react"

interface PaymentInfo {
  cardNumber: string
  cardHolder: string
  bank: string
  amount: number
  telegramUsername: string
  note: string
}

export default function CheckoutButton({ invitationId }: { invitationId: string }) {
  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [note, setNote] = useState("")

  const handleOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, telegramNote: note }),
      })
      const data = await res.json()
      if (data.success) {
        setPaymentInfo(data.paymentInfo)
      } else {
        alert(data.error || "Xatolik yuz berdi")
      }
    } finally {
      setLoading(false)
    }
  }

  if (paymentInfo) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Buyurtma yaratildi!</span>
        </div>
        <div className="p-4 bg-green-50 rounded-xl border border-green-200 space-y-2">
          <p className="text-sm font-semibold text-green-800">
            💳 Quyidagi kartaga to'lov qiling:
          </p>
          <p className="text-lg font-mono font-bold text-green-900">{paymentInfo.cardNumber}</p>
          <p className="text-sm text-green-700">{paymentInfo.cardHolder} • {paymentInfo.bank}</p>
          <p className="text-base font-bold text-green-800">
            {(paymentInfo.amount / 100).toLocaleString()} so'm
          </p>
          <hr className="border-green-200 my-2" />
          <p className="text-sm text-green-700">
            To'lovdan keyin skrinshotni Telegram orqali yuboring:
          </p>
          <a
            href={`https://t.me/${paymentInfo.telegramUsername.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            📱 Telegram: {paymentInfo.telegramUsername}
          </a>
          <p className="text-xs text-green-600 bg-green-100 p-2 rounded-lg">
            ℹ️ Izoh sifatida yuboring: <strong>{paymentInfo.note}</strong>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Ixtiyoriy: qo'shimcha izoh (masalan: 5 ta bosmali nusxa kerak)"
        rows={2}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
      />
      <button
        onClick={handleOrder}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Yaratilmoqda...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" /> Buyurtma berish
          </>
        )}
      </button>
    </div>
  )
}
