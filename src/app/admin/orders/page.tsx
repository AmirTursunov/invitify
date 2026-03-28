// src/app/admin/orders/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import AdminOrderActions from "@/components/ui/admin-order-actions"
import { ORDER_STATUS_LABELS } from "@/types"

interface Props { searchParams: Promise<{ status?: string; page?: string }> }
export const metadata = { title: "Admin — Buyurtmalar" }

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")

  const { status, page: pageParam } = await searchParams
  const page = Number(pageParam || 1)
  const limit = 20
  const db = await getDb()
  const filter = status ? { status } : {}

  const [orders, total] = await Promise.all([
    db.collection("orders").find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection("orders").countDocuments(filter),
  ])

  const userIds = [...new Set(orders.map(o => o.userId))]
  const users = await db.collection("users").find({ _id: { $in: userIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]))

  const invIds = orders.map(o => { try { return new ObjectId(o.invitationId) } catch { return null } }).filter(Boolean)
  const invitations = await db.collection("invitations").find({ _id: { $in: invIds } }).toArray()
  const templateIds = [...new Set(invitations.map(i => i.templateId))]
  const templates = await db.collection("templates").find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), t]))
  const invMap = Object.fromEntries(invitations.map(i => [i._id.toString(), { ...i, template: templateMap[i.templateId] }]))

  const tabs = [
    { label: "Barchasi", value: "" },
    { label: "Kutilmoqda", value: "PENDING" },
    { label: "To'lov yuborildi", value: "PAYMENT_SENT" },
    { label: "Tasdiqlandi", value: "CONFIRMED" },
    { label: "Rad etildi", value: "REJECTED" },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buyurtmalar</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <a key={tab.value} href={`/admin/orders${tab.value ? `?status=${tab.value}` : ""}`}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${(status === tab.value || (!status && !tab.value)) ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {tab.label}
          </a>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 text-sm text-gray-500">Jami: {total} ta buyurtma</div>
        {orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400">Buyurtma topilmadi</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const orderId = order._id.toString()
              const user = userMap[order.userId]
              const inv = invMap[order.invitationId]
              const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: "gray" }
              return (
                <div key={orderId} className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-800">{user?.name || user?.email}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color === "green" ? "bg-green-100 text-green-700" : statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : statusInfo.color === "blue" ? "bg-blue-100 text-blue-700" : statusInfo.color === "red" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{statusInfo.label}</span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-0.5">
                        <div>📧 {user?.email}</div>
                        {user?.phone && <div>📱 {user.phone}</div>}
                        <div>🎨 {inv?.template?.name} — {inv?.title}</div>
                        <div>💰 {(order.amount / 100).toLocaleString()} so'm</div>
                        <div>🕐 {new Date(order.createdAt).toLocaleString("uz-UZ")}</div>
                        {order.telegramNote && <div className="text-blue-600">💬 {order.telegramNote}</div>}
                        <div className="font-mono text-xs text-gray-400">ID: {orderId}</div>
                      </div>
                    </div>
                    {["PENDING","PAYMENT_SENT"].includes(order.status) && <AdminOrderActions orderId={orderId} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
