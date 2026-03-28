// src/app/admin/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, Users, FileText, TrendingUp, ArrowRight, Clock } from "lucide-react"
import { ORDER_STATUS_LABELS } from "@/types"

export const metadata = { title: "Admin Panel" }

export default async function AdminPage() {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")

  const db = await getDb()
  const [totalUsers, totalInvitations, totalOrders, pendingCount, revenueAgg, recentOrders] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("invitations").countDocuments(),
    db.collection("orders").countDocuments(),
    db.collection("orders").countDocuments({ status: { $in: ["PENDING", "PAYMENT_SENT"] } }),
    db.collection("orders").aggregate([{ $match: { status: "CONFIRMED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
    db.collection("orders").find({ status: { $in: ["PENDING", "PAYMENT_SENT"] } }).sort({ createdAt: -1 }).limit(10).toArray(),
  ])

  const totalRevenue = revenueAgg[0]?.total || 0

  const userIds = [...new Set(recentOrders.map(o => o.userId))]
  const users = await db.collection("users").find({ _id: { $in: userIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]))

  const invIds = recentOrders.map(o => { try { return new ObjectId(o.invitationId) } catch { return null } }).filter(Boolean)
  const invitations = await db.collection("invitations").find({ _id: { $in: invIds } }).toArray()
  const templateIds = [...new Set(invitations.map(i => i.templateId))]
  const templates = await db.collection("templates").find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), t]))
  const invMap = Object.fromEntries(invitations.map(i => [i._id.toString(), { ...i, template: templateMap[i.templateId] }]))

  const stats = [
    { label: "Foydalanuvchilar", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "Taklifnomalar", value: totalInvitations, icon: FileText, href: "/admin/invitations" },
    { label: "Jami buyurtmalar", value: totalOrders, icon: ShoppingBag, href: "/admin/orders" },
    { label: "Kutilmoqda", value: pendingCount, icon: Clock, href: "/admin/orders?status=PENDING" },
    { label: "Jami tushum", value: `${(totalRevenue / 100).toLocaleString()} so'm`, icon: TrendingUp, href: "/admin/orders?status=CONFIRMED" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500">Barcha buyurtmalar va foydalanuvchilarni boshqaring</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-purple-50 text-purple-600">
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-800">Tasdiqlash kutilayotgan buyurtmalar</h2>
            {pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{pendingCount}</span>}
          </div>
          <Link href="/admin/orders" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">Barchasi <ArrowRight className="w-3 h-3" /></Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-400"><Clock className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>Kutilayotgan buyurtma yo'q</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const user = userMap[order.userId]
              const inv = invMap[order.invitationId]
              const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: "gray" }
              return (
                <Link key={order._id.toString()} href={`/admin/orders`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-gray-800">{user?.name || user?.email}</div>
                    <div className="text-xs text-gray-400">{inv?.template?.name} • {inv?.title}</div>
                    <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("uz-UZ")}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="font-semibold text-sm">{(order.amount / 100).toLocaleString()} so'm</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{statusInfo.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
