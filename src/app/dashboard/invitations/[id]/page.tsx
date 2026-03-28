// src/app/dashboard/invitations/[id]/page.tsx
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import { INVITATION_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/types"
import CheckoutButton from "@/components/ui/checkout-button"
import CopyButton from "@/components/ui/copy-button"
import DownloadImageButton from "@/components/ui/DownloadImageButton"

interface Props { params: Promise<{ id: string }> }

export default async function InvitationDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user!.id!
  const db = await getDb()

  let inv: any
  try { inv = await db.collection("invitations").findOne({ _id: new ObjectId(id), userId }) }
  catch { notFound() }
  if (!inv) notFound()

  const [template, order] = await Promise.all([
    db.collection("templates").findOne({ _id: new ObjectId(inv.templateId) }),
    db.collection("orders").findOne({ invitationId: id }),
  ])

  const statusInfo = INVITATION_STATUS_LABELS[inv.status] || { label: inv.status, color: "gray" }
  const orderStatusInfo = order ? ORDER_STATUS_LABELS[order.status] : null
  const canOrder = inv.status === "DRAFT" && !order

  const safeTemplate = template ? {
    ...template,
    _id: template._id.toString(),
    createdAt: template.createdAt?.toISOString(),
    updatedAt: template.updatedAt?.toISOString(),
  } : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/invitations" className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{inv.title}</h1>
          <p className="text-sm text-gray-500">{template?.name}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Holat</h2>
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo.color === "green" ? "bg-green-100 text-green-700" : statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
              {statusInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {["Qoralama", "To'lov", "Faol"].map((s, i) => {
              const isDone = (i === 0 && ["PENDING_PAYMENT","PAID","ACTIVE"].includes(inv.status)) || (i === 1 && ["PAID","ACTIVE"].includes(inv.status)) || (i === 2 && inv.status === "ACTIVE")
              return (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-full h-2 rounded-full ${isDone ? "bg-purple-500" : "bg-gray-200"}`} />
                  <span className="text-xs text-gray-400 whitespace-nowrap">{s}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Preview & Share */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Ko'rish va ulashish</h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/invite/${inv.slug}`} target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors">
              <Eye className="w-4 h-4" /> Ko'rish
            </Link>
            {inv.publicUrl && <CopyButton text={inv.publicUrl} label="Havolani nusxalash" />}
          </div>
          {inv.publicUrl && <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-500 break-all font-mono">{inv.publicUrl}</div>}
          
          <DownloadImageButton template={safeTemplate} data={inv.data} isPaid={["ACTIVE", "PAID"].includes(inv.status) || order?.status === "PAID"} title={inv.title} />
        </div>

        {/* Order */}
        {order ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Buyurtma</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Buyurtma ID</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{order._id.toString().slice(0, 16)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Summa</span>
                <span className="font-semibold">{(order.amount / 100).toLocaleString()} so'm</span>
              </div>
              {orderStatusInfo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Holat</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${orderStatusInfo.color === "green" ? "bg-green-100 text-green-700" : orderStatusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>
                    {orderStatusInfo.label}
                  </span>
                </div>
              )}
              {order.status === "PENDING" && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">💳 To'lov qilish uchun:</p>
                  <p className="text-sm text-yellow-700 mb-1">Karta: <span className="font-mono font-bold">{process.env.NEXT_PUBLIC_CARD_NUMBER || "8600 **** **** ****"}</span></p>
                  <p className="text-sm text-yellow-700">Telegram: <a href={`https://t.me/${(process.env.NEXT_PUBLIC_TELEGRAM_MANAGER || "invitify_manager").replace("@","")}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">@{(process.env.NEXT_PUBLIC_TELEGRAM_MANAGER || "invitify_manager").replace("@","")}</a></p>
                  <p className="text-xs text-yellow-600 mt-2 font-mono bg-yellow-100 p-2 rounded">Izoh: Buyurtma ID: {order._id.toString()}</p>
                </div>
              )}
              {order.adminNote && <div className="mt-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">📝 {order.adminNote}</div>}
            </div>
          </div>
        ) : canOrder ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-2">Buyurtma berish</h2>
            <p className="text-sm text-gray-500 mb-4">Taklifnomangizni faollashtirish uchun to'lov qiling</p>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl mb-4">
              <span className="text-gray-700">Narx</span>
              <span className="text-xl font-bold text-purple-700">
                {template?.price === 0 ? "Bepul" : `${((template?.price || 0) / 100).toLocaleString()} so'm`}
              </span>
            </div>
            <CheckoutButton invitationId={id} />
          </div>
        ) : null}

        {/* Data */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-800 mb-4">Ma'lumotlar</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(inv.data as Record<string, string>).filter(([, v]) => v).map(([key, value]) => (
              <div key={key} className="text-sm">
                <div className="text-gray-400 text-xs capitalize mb-0.5">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</div>
                <div className="text-gray-800 font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
