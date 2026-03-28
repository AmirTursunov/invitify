// src/app/templates/[slug]/page.tsx
import { getDb } from "@/lib/mongodb"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { CATEGORY_LABELS, type TemplateFields, type TemplateStyles } from "@/types"
import Link from "next/link"
import { Crown, Check, ArrowRight } from "lucide-react"

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const db = await getDb()
  const template = await db.collection("templates").findOne({ slug })
  return { title: template?.name || "Shablon" }
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params
  const [session, db] = await Promise.all([auth(), getDb()])
  const template = await db.collection("templates").findOne({ slug, isActive: true })
  if (!template) notFound()

  const fields = template.fields as TemplateFields
  const styles = template.styles as TemplateStyles
  const templateId = template._id.toString()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="rounded-2xl overflow-hidden aspect-[3/4] flex items-center justify-center relative shadow-xl"
              style={{ background: `linear-gradient(135deg, ${styles.primaryColor}33, ${styles.primaryColor}66)`, backgroundColor: styles.bgColor }}>
              <div className="text-center p-8 max-w-xs">
                <div className="text-6xl font-bold mb-4" style={{ color: styles.primaryColor }}>{template.name.charAt(0)}</div>
                <div className="space-y-2">
                  {[32, 24, 28].map((w, i) => (
                    <div key={i} className="h-2 rounded-full mx-auto opacity-20" style={{ background: styles.primaryColor, width: `${w * 3}px` }} />
                  ))}
                </div>
              </div>
              {template.isPremium && (
                <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Premium
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium w-fit mb-4">
              {CATEGORY_LABELS[template.category] || template.category}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{template.name}</h1>
            {template.description && <p className="text-gray-500 mb-6">{template.description}</p>}

            <div className="bg-white rounded-xl p-5 border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  {template.price === 0 ? "Bepul" : `${(template.price / 100).toLocaleString()} so'm`}
                </span>
              </div>
              <div className="space-y-2 mb-5">
                {["Chiroyli dizayn", "Online ulashish havolasi", "QR kod", "Cheksiz ko'rishlar"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />{item}
                  </div>
                ))}
              </div>
              <Link href={session ? `/dashboard/create?template=${templateId}` : `/auth/login?redirect=/dashboard/create?template=${templateId}`}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold text-center flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                {session ? "Shu shablon bilan boshlash" : "Kirish va boshlash"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">Maydonlar ({Object.keys(fields).length} ta):</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(fields).map(([key, field]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-gray-500">
                    <div className={`w-1.5 h-1.5 rounded-full ${field.required ? "bg-purple-500" : "bg-gray-300"}`} />
                    {field.label}{field.required && <span className="text-red-400">*</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
