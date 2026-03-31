// src/app/admin/users/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import { Search, User as UserIcon, Mail, Phone, Calendar, ShoppingBag, FileText, ChevronRight } from "lucide-react"
import { type DbUser } from "@/types"

export const metadata = { title: "Admin — Foydalanuvchilar" }

export default async function AdminUsersPage() {
  const session = await auth()
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")
  const db = await getDb()
  const usersRaw = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()
  const users = usersRaw as unknown as DbUser[]

  const userIdsStrings = users.map(u => u._id?.toString()).filter(Boolean) as string[]
  const userIdsObjectIds = userIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[]

  const [invCounts, orderCounts] = await Promise.all([
    db.collection("invitations").aggregate([
      { $match: { $or: [{ userId: { $in: userIdsStrings } }, { userId: { $in: userIdsObjectIds as any } }] } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]).toArray(),
    db.collection("orders").aggregate([
      { $match: { $or: [{ userId: { $in: userIdsStrings } }, { userId: { $in: userIdsObjectIds as any } }] } },
      { $group: { _id: "$userId", count: { $sum: 1 } } }
    ]).toArray(),
  ])

  const invCountMap = Object.fromEntries(invCounts.map(i => [i._id.toString(), i.count]))
  const orderCountMap = Object.fromEntries(orderCounts.map(o => [o._id.toString(), o.count]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foydalanuvchilar</h1>
          <p className="text-sm text-gray-500 mt-1">Platformada jami {users.length} ta foydalanuvchi bor</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Ism yoki email..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Foydalanuvchi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kontakt</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Faoliyat</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Rol</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const uid = user._id?.toString() || ""
                const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || user.email.charAt(0).toUpperCase()
                
                return (
                  <tr key={uid} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-bold border border-white shadow-sm shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 truncate group-hover:text-purple-600 transition-colors">{user.name || "Ismsiz"}</div>
                          <div className="text-[10px] font-mono text-gray-300">ID: {uid.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="w-3 h-3 text-gray-400" /> {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Phone className="w-3 h-3 text-gray-400" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center group/inv hover:scale-110 transition-transform">
                          <div className="text-xs font-bold text-gray-900">{invCountMap[uid] || 0}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase">Taklif</div>
                        </div>
                        <div className="w-px h-6 bg-gray-100" />
                        <div className="text-center group/ord hover:scale-110 transition-transform">
                          <div className="text-xs font-bold text-gray-900">{orderCountMap[uid] || 0}</div>
                          <div className="text-[9px] font-bold text-gray-400 uppercase">Buyurtma</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm
                        ${user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-700 shadow-red-100/30" : 
                          user.role === "ADMIN" ? "bg-orange-100 text-orange-700 shadow-orange-100/30" : 
                          "bg-blue-50 text-blue-600 shadow-blue-50/30"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs font-bold text-gray-700">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("uz-UZ") : "—"}
                      </div>
                      <div className="text-[10px] text-gray-400 font-medium">Ro'yxatdan o'tgan</div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
