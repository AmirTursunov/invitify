// src/app/admin/users/page.tsx
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")
  const db = await getDb()
  const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()

  const userIds = users.map(u => u._id.toString())
  const [invCounts, orderCounts] = await Promise.all([
    db.collection("invitations").aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]).toArray(),
    db.collection("orders").aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: "$userId", count: { $sum: 1 } } }]).toArray(),
  ])
  const invCountMap = Object.fromEntries(invCounts.map(i => [i._id, i.count]))
  const orderCountMap = Object.fromEntries(orderCounts.map(o => [o._id, o.count]))

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Foydalanuvchilar ({users.length})</h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Foydalanuvchi</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Telefon</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Taklif</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Buyurtma</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Rol</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Sana</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => {
              const uid = user._id.toString()
              return (
                <tr key={uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-xs shrink-0">
                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{user.name || "—"}</div>
                        <div className="text-xs text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{user.phone || "—"}</td>
                  <td className="px-5 py-3 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">{invCountMap[uid] || 0}</span></td>
                  <td className="px-5 py-3 text-center"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{orderCountMap[uid] || 0}</span></td>
                  <td className="px-5 py-3"><span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "SUPER_ADMIN" ? "bg-red-100 text-red-700" : user.role === "ADMIN" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>{user.role}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("uz-UZ") : "—"}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
