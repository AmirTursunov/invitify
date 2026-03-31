// src/app/admin/invitations/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Search, FileText, User, Eye, ExternalLink, Calendar, Tag } from "lucide-react"
import { type DbInvitation, type DbUser, type DbTemplate, INVITATION_STATUS_LABELS } from "@/types"

export const metadata = { title: "Admin — Taklifnomalar" }

export default async function AdminInvitationsPage() {
  const session = await auth()
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard")

  const db = await getDb()
  const invitationsRaw = await db.collection("invitations").find({}).sort({ createdAt: -1 }).limit(50).toArray()
  const invitations = invitationsRaw as unknown as DbInvitation[]

  const userIds = [...new Set(invitations.map(i => i.userId).filter(Boolean))]
  const usersRaw = await db.collection("users").find({
    $or: [
      { _id: { $in: userIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
      { _id: { $in: userIds.filter(id => typeof id === "string" && id.length !== 24) } as any }
    ]
  }).toArray()
  const users = usersRaw as unknown as DbUser[]
  const userMap = Object.fromEntries(users.map(u => [u._id?.toString() || "", u]))

  const templateIds = [...new Set(invitations.map(i => i.templateId).filter(Boolean))]
  const templatesRaw = await db.collection("templates").find({
    $or: [
      { _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
      { _id: { $in: templateIds.filter(id => typeof id === "string" && id.length !== 24) } as any }
    ]
  }).toArray()
  const templates = templatesRaw as unknown as DbTemplate[]
  const templateMap = Object.fromEntries(templates.map(t => [t._id?.toString() || "", t]))

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taklifnomalar</h1>
          <p className="text-sm text-gray-500 mt-1">Platformada yaratilgan barcha taklifnomalar ro'yxati</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Sarlavha bo'yicha qidirish..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taklifnoma</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Foydalanuvchi</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Holat</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Ko'rishlar</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Sana</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invitations.map((inv) => {
                const id = inv._id?.toString() || ""
                const user = userMap[inv.userId]
                const template = templateMap[inv.templateId]
                const statusInfo = INVITATION_STATUS_LABELS[inv.status] || { label: inv.status, color: "gray" }
                
                return (
                  <tr key={id} className="hover:bg-gray-50/80 transition-colors group text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold border border-purple-100 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">{inv.title || "Sarlavhasiz"}</div>
                          <div className="text-[10px] font-medium text-purple-500 uppercase tracking-tighter flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5" /> {template?.name || "Noma'lum shablon"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-white">
                          {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 max-w-[120px]">
                          <div className="text-xs font-semibold text-gray-700 truncate">{user?.name || "Ismsiz"}</div>
                          <div className="text-[9px] text-gray-400 truncate">{user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm
                        ${statusInfo.color === "green" ? "bg-green-100 text-green-700 shadow-green-100/30" : 
                          statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700 shadow-yellow-100/30" : 
                          statusInfo.color === "blue" ? "bg-blue-100 text-blue-700 shadow-blue-100/30" : 
                          statusInfo.color === "red" ? "bg-red-100 text-red-700 shadow-red-100/30" : 
                          "bg-gray-100 text-gray-600 shadow-gray-100/30"}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-xs font-bold text-gray-900">{inv.viewCount || 0}</div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          <Eye className="w-2.5 h-2.5" /> ko'rishlar
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-xs font-bold text-gray-700">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("uz-UZ") : "—"}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Yaratilgan</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/invite/${inv.slug}`} 
                        target="_blank"
                        className="p-2 inline-flex items-center justify-center bg-gray-50 hover:bg-purple-50 text-gray-400 hover:text-purple-600 rounded-lg transition-all border border-gray-100 hover:border-purple-100 shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
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
