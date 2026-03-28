// src/app/admin/stats/page.tsx
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import { BarChart3 } from "lucide-react"
import { CATEGORY_LABELS } from "@/types"

export default async function AdminStatsPage() {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")
  const db = await getDb()

  const [totalRevenueAgg, monthRevenueAgg, ordersByStatus, topTemplatesRaw] = await Promise.all([
    db.collection("orders").aggregate([{ $match: { status: "CONFIRMED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
    db.collection("orders").aggregate([
      { $match: { status: "CONFIRMED", confirmedAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]).toArray(),
    db.collection("orders").aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
    db.collection("invitations").aggregate([{ $group: { _id: "$templateId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]).toArray(),
  ])

  const totalRevenue = totalRevenueAgg[0]?.total || 0
  const monthRevenue = monthRevenueAgg[0]?.total || 0
  const maxCount = topTemplatesRaw[0]?.count || 1

  const templateIds = topTemplatesRaw.map(t => t._id)
  const { ObjectId } = await import("mongodb")
  const templates = await db.collection("templates").find({
    _id: { $in: templateIds.map((id: string) => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) }
  }).toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), t]))

  const statusLabels: Record<string, string> = { PENDING: "Kutilmoqda", PAYMENT_SENT: "To'lov yuborildi", CONFIRMED: "Tasdiqlandi", REJECTED: "Rad etildi", REFUNDED: "Qaytarildi" }
  const statusColors: Record<string, string> = { PENDING: "bg-yellow-100 text-yellow-700", PAYMENT_SENT: "bg-blue-100 text-blue-700", CONFIRMED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700", REFUNDED: "bg-gray-100 text-gray-600" }
  const total = ordersByStatus.reduce((a, b) => a + b.count, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">Statistika</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Jami tushum</div>
          <div className="text-3xl font-bold text-gray-900">{(totalRevenue / 100).toLocaleString()}</div>
          <div className="text-sm text-gray-400">so'm</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="text-sm text-gray-500 mb-1">Bu oy</div>
          <div className="text-3xl font-bold text-purple-600">{(monthRevenue / 100).toLocaleString()}</div>
          <div className="text-sm text-gray-400">so'm</div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Buyurtmalar holati</h2>
        <div className="space-y-3">
          {ordersByStatus.map((item) => (
            <div key={item._id} className="flex items-center justify-between">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[item._id] || "bg-gray-100 text-gray-600"}`}>{statusLabels[item._id] || item._id}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min((item.count / total) * 100, 100)}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-semibold text-gray-800 mb-4">Eng ko'p ishlatiladigan shablonlar</h2>
        <div className="space-y-3">
          {topTemplatesRaw.map((item, index) => {
            const template = templateMap[item._id]
            return (
              <div key={item._id} className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate">{template?.name || "Noma'lum"}</div>
                  <div className="text-xs text-gray-400">{CATEGORY_LABELS[template?.category] || template?.category}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(item.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6 text-right">{item.count}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
