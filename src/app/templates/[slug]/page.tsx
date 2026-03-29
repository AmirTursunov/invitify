// src/app/templates/[slug]/page.tsx
import { getDb, ObjectId } from "@/lib/mongodb"
import { auth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { CATEGORY_LABELS, type TemplateFields, type TemplateStyles } from "@/types"
import Link from "next/link"
import { Crown, Check, ArrowRight } from "lucide-react"
import TemplateRenderer from "@/components/templates/TemplateRenderer"

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

  // Serialize template for Client Components
  const safeTemplate = {
    ...template,
    _id: template._id.toString(),
    createdAt: template.createdAt?.toISOString(),
    updatedAt: template.updatedAt?.toISOString(),
  };

  const fields = template.fields as TemplateFields
  const templateId = template._id.toString()

  // Generate beautiful sample data based on fields
  const sampleData: Record<string, string> = { _title: "Namuna Taklifnoma" };
  Object.entries(fields as Record<string, any>).forEach(([key, f]) => {
    if (key.includes("Name") || key.includes("groom") || key.includes("bride")) sampleData[key] = f.placeholder || "Azizbek";
    if (key === "bride") sampleData[key] = "Aziza";
    if (key.includes("date")) sampleData[key] = "2024-12-31";
    if (key.includes("time")) sampleData[key] = "18:00";
    if (key.includes("venue")) sampleData[key] = "Yakkasaroy Restorani";
    if (key.includes("address")) sampleData[key] = "Toshkent shahri, Yakkasaroy tumani 15";
    if (key.includes("phone")) sampleData[key] = "+998 90 123 45 67";
    if (key.includes("message")) sampleData[key] = "Sizlarni ushbu quvonchli kunimizda kutib qolamiz!";
    if (key.includes("company")) sampleData[key] = "Innovatsiya MChJ";
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 w-full flex-1">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: Form & Details */}
          <div className="flex flex-col order-2 lg:order-1">
            <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-5">
              {CATEGORY_LABELS[template.category] || template.category}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight leading-tight">
              {template.name}
              {template.isPremium && <Crown className="inline-block w-8 h-8 text-amber-500 ml-3 mb-2" />}
            </h1>
            
            {template.description && <p className="text-gray-500 text-lg mb-8 leading-relaxed">{template.description}</p>}

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 mb-8 shadow-sm">
              <div className="flex items-end justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <div className="text-sm text-gray-400 font-medium mb-1 uppercase tracking-wider">Shablon narxi</div>
                  <span className="text-3xl md:text-4xl font-black text-gray-900">
                    {template.price === 0 ? "Bepul" : `${(template.price / 100).toLocaleString()} so'm`}
                  </span>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {["Ajoyib zamonaviy dizayn", "Mobil va Web moslashuvchan", "QR kodli vizitka uslubi", "Cheksiz marta ulashish", "To'lovdan so'ng rasm ko'rinishida yuklash"].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-600 font-medium">
                    <div className="mt-0.5 bg-green-100 p-0.5 rounded-full"><Check className="w-3.5 h-3.5 text-green-600 shrink-0" /></div>
                    {item}
                  </div>
                ))}
              </div>
              
              <Link href={session ? `/dashboard/create?template=${templateId}` : `/auth/login?redirect=/dashboard/create?template=${templateId}`}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-2xl font-bold text-lg text-center flex items-center justify-center gap-2 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98]">
                {session ? "Shu shablon bilan boshlash" : "Kirish va taklifnoma yaratish"}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="bg-white/50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded flex items-center justify-center text-xs">{Object.keys(fields).length}</span>
                To'ldiriladigan maydonlar
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(fields).map(([key, field]) => (
                  <div key={key} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${field.required ? 'bg-white border-purple-200 text-purple-700' : 'bg-transparent border-gray-200 text-gray-500'}`}>
                    {field.label} {field.required && <span className="text-red-400 ml-0.5">*</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Realistic Template Preview */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end lg:sticky lg:top-8">
             {/* Realistic Phone Frame */}
             <div className="relative w-full max-w-[380px] aspect-[9/19.5] bg-gray-900 rounded-[3rem] p-3 shadow-2xl flex shrink-0 ring-1 ring-black/5 ring-offset-4 ring-offset-gray-50 transform transition duration-500 hover:scale-[1.02]">
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
                  <div className="w-[120px] h-[30px] bg-gray-900 rounded-b-3xl"></div>
                </div>
                <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
                  <div className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth">
                     <TemplateRenderer template={safeTemplate as any} data={sampleData} />
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
