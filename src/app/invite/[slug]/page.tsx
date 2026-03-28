// src/app/invite/[slug]/page.tsx
import { getDb, ObjectId } from "@/lib/mongodb"
import { notFound } from "next/navigation"
import type { InvitationData } from "@/types"
import QRCode from "qrcode"
import TemplateRenderer from "@/components/templates/TemplateRenderer"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const db = await getDb()
  const inv = await db.collection("invitations").findOne({ slug })
  if (!inv) return { title: "Taklifnoma topilmadi" }
  const template = await db.collection("templates").findOne({ _id: new ObjectId(inv.templateId.toString()) })
  return { title: inv.title, description: `${template?.name} — Invitify` }
}

export default async function PublicInvitePage({ params }: Props) {
  const { slug } = await params
  const db = await getDb()
  const inv = await db.collection("invitations").findOne({ slug })
  if (!inv) notFound()

  db.collection("invitations").updateOne({ slug }, { $inc: { viewCount: 1 } }).catch(console.error)

  if (!["ACTIVE", "DRAFT", "PENDING_PAYMENT", "PAID"].includes(inv.status)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Taklifnoma mavjud emas</h1>
          <p className="text-gray-500">Bu taklifnoma muddati o'tgan yoki bekor qilingan.</p>
        </div>
      </div>
    )
  }

  const template = await db.collection("templates").findOne({ _id: new ObjectId(inv.templateId.toString()) })
  if (!template) notFound()

  // Serialize to pass to client component safely
  const safeTemplate = {
    ...template,
    _id: template._id.toString(),
    createdAt: template.createdAt?.toISOString(),
    updatedAt: template.updatedAt?.toISOString(),
  }

  const data = inv.data as InvitationData
  const primaryColor = template?.styles?.primaryColor || "#7C3AED";

  let qrDataUrl = ""
  if (inv.publicUrl) {
    try { qrDataUrl = await QRCode.toDataURL(inv.publicUrl, { width: 120, margin: 1, color: { dark: primaryColor, light: "#FFFFFF" } }) }
    catch {}
  }

  // To make it look like a real mobile invitation view for users visiting the link:
  // We'll wrap the TemplateRenderer in a full-screen view.
  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-zinc-950 sm:p-4">
      <div className="w-full sm:max-w-md h-screen sm:h-[90vh] sm:rounded-[2.5rem] overflow-hidden shadow-2xl relative bg-white flex flex-col items-center justify-center">
         <div className="w-full h-full overflow-y-auto no-scrollbar relative flex flex-col justify-center">
            <TemplateRenderer template={safeTemplate as any} data={data} isView={true} />
            
            {/* Display QR dynamically at bottom if available */}
            {qrDataUrl && (
              <div className="absolute top-10 right-4 p-2 bg-white/80 backdrop-blur rounded-2xl shadow-sm z-50">
                <img src={qrDataUrl} alt="QR kod" className="w-12 h-12" />
              </div>
            )}
         </div>
      </div>
      <div className="text-center mt-4 text-xs text-zinc-500 font-medium tracking-wide">
        Powered by <a href="/" className="text-zinc-400 hover:text-white transition group">Invitify<span className="opacity-0 group-hover:opacity-100 transition">.uz</span></a>
      </div>
    </div>
  )
}
