// src/app/dashboard/invitations/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import Link from "next/link"
import { FileText, PlusCircle, Eye, ExternalLink } from "lucide-react"
import { INVITATION_STATUS_LABELS, type TemplateStyles } from "@/types"

export const metadata = { title: "Taklifnomalarim" }

export default async function InvitationsPage() {
  const session = await auth()
  const userId = session!.user!.id!
  const db = await getDb()

  const invRaw = await db.collection("invitations").find({ userId }).sort({ createdAt: -1 }).toArray()
  const templateIds = [...new Set(invRaw.map(i => i.templateId))]
  const templates = await db.collection("templates").find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), t]))

  const orderMap: Record<string, any> = {}
  const orders = await db.collection("orders").find({ invitationId: { $in: invRaw.map(i => i._id.toString()) } }).toArray()
  orders.forEach(o => { orderMap[o.invitationId] = o })

  const invitations = invRaw.map(i => ({ ...i, id: i._id.toString(), template: templateMap[i.templateId], order: orderMap[i._id.toString()] || null }))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taklifnomalarim</h1>
          <p className="text-sm text-gray-500 mt-1">{invitations.length} ta taklifnoma</p>
        </div>
        <Link href="/dashboard/create" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
          <PlusCircle className="w-4 h-4" /> Yangi yaratish
        </Link>
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FileText className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Hali taklifnoma yo'q</h3>
          <Link href="/dashboard/create" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors mt-4">
            <PlusCircle className="w-4 h-4" /> Taklifnoma yaratish
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const styles = inv.template?.styles as TemplateStyles | undefined
            const statusInfo = INVITATION_STATUS_LABELS[inv.status] || { label: inv.status, color: "gray" }
            return (
              <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
                    style={{ background: `linear-gradient(135deg, ${styles?.primaryColor || "#7C3AED"}, ${styles?.primaryColor || "#7C3AED"}99)` }}>
                    {inv.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <Link href={`/dashboard/invitations/${inv.id}`} className="font-semibold text-gray-800 hover:text-purple-700 transition-colors">{inv.title}</Link>
                        <div className="text-xs text-gray-400 mt-0.5">{inv.template?.name} • {new Date(inv.createdAt).toLocaleDateString("uz-UZ")}</div>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusInfo.color === "green" ? "bg-green-100 text-green-700" : statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : statusInfo.color === "blue" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400"><Eye className="w-3.5 h-3.5" />{inv.viewCount} ko'rish</div>
                      <div className="flex items-center gap-2 ml-auto">
                        {inv.status === "ACTIVE" && inv.slug && (
                          <Link href={`/invite/${inv.slug}`} target="_blank" className="text-xs flex items-center gap-1 text-purple-600 hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" /> Ko'rish
                          </Link>
                        )}
                        <Link href={`/dashboard/invitations/${inv.id}`} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors text-gray-600">Batafsil</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
