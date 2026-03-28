// src/app/templates/page.tsx
import { getDb } from "@/lib/mongodb"
import { CATEGORY_LABELS, type TemplateStyles } from "@/types"
import Link from "next/link"
import { Search, Crown, Sparkles } from "lucide-react"

interface Props {
  searchParams: Promise<{ category?: string; search?: string }>
}

export const metadata = { title: "Shablonlar" }

export default async function TemplatesPage({ searchParams }: Props) {
  const { category, search } = await searchParams
  const db = await getDb()

  const filter: Record<string, unknown> = { isActive: true }
  if (category) filter.category = category
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ]

  const templates = await db.collection("templates").find(filter).sort({ sortOrder: 1 }).toArray()
  const allCategories = Object.entries(CATEGORY_LABELS)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shablonlar</h1>
              <p className="text-sm text-gray-500">{templates.length} ta shablon topildi</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="search" defaultValue={search} placeholder="Qidirish..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">Qidirish</button>
            </form>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            <Link href="/templates" className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Hammasi
            </Link>
            {allCategories.map(([key, label]) => (
              <Link key={key} href={`/templates?category=${key}`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {templates.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Hech narsa topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template) => {
              const styles = template.styles as TemplateStyles
              const id = template._id.toString()
              return (
                <Link key={id} href={`/templates/${template.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                  <div className="h-48 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${styles.primaryColor}22, ${styles.primaryColor}44)` }}>
                    <div className="text-center p-4">
                      <div className="text-4xl font-bold mb-2" style={{ color: styles.primaryColor }}>
                        {template.name.charAt(0)}
                      </div>
                      <div className="text-xs text-gray-500">{CATEGORY_LABELS[template.category] || template.category}</div>
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-3 right-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Premium
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur text-xs px-2 py-1 rounded-full text-gray-600">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{template.name}</h3>
                    {template.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{template.description}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {template.price === 0 ? "Bepul" : `${(template.price / 100).toLocaleString()} so'm`}
                      </span>
                    </div>
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
