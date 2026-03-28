// src/app/page.tsx
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { CATEGORY_LABELS } from "@/types"
import { Sparkles, Star, Zap, Shield, Globe, ChevronRight, Heart, Music, Briefcase, GraduationCap, Baby, Trophy } from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  WEDDING: <Heart className="w-5 h-5" />,
  BIRTHDAY: <Sparkles className="w-5 h-5" />,
  CONCERT: <Music className="w-5 h-5" />,
  MEETING: <Briefcase className="w-5 h-5" />,
  CORPORATE: <Briefcase className="w-5 h-5" />,
  GRADUATION: <GraduationCap className="w-5 h-5" />,
  BABY_SHOWER: <Baby className="w-5 h-5" />,
  SPORTS: <Trophy className="w-5 h-5" />,
}

export default async function HomePage() {
  const session = await auth()
  const db = await getDb()

  const [templateCount, categoryCounts] = await Promise.all([
    db.collection("templates").countDocuments({ isActive: true }),
    db.collection("templates").aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]).toArray(),
  ])

  const stats = [
    { label: "Shablon", value: `${templateCount}+` },
    { label: "Kategoriya", value: `${categoryCounts.length}` },
    { label: "Faol foydalanuvchi", value: "500+" },
    { label: "Yaratilgan taklifnoma", value: "2000+" },
  ]

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Tez yaratish", desc: "Bir necha daqiqada professional taklifnoma yarating" },
    { icon: <Star className="w-6 h-6" />, title: "18+ shablon", desc: "To'y, konsert, meeting va boshqa tadbirlar uchun" },
    { icon: <Globe className="w-6 h-6" />, title: "Online ulashish", desc: "Havola orqali mehmonlarga yuboring" },
    { icon: <Shield className="w-6 h-6" />, title: "Xavfsiz to'lov", desc: "Telegram orqali menejer bilan to'g'ridan-to'g'ri" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-purple-600">✨ Invitify</Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/templates" className="hover:text-purple-600 transition-colors">Shablonlar</Link>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link href="/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-gray-600 hover:text-purple-600">Kirish</Link>
                <Link href="/auth/register" className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">Boshlash</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            O'zbekistondagi #1 taklifnoma platformasi
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Taklifnomangizni<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">professional qiling</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            To'y, tug'ilgan kun, konsert, meeting va boshqa barcha tadbirlar uchun bir necha daqiqada chiroyli taklifnoma yarating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/templates" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              Shablon tanlash <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Kategoriyalar</h2>
          <p className="text-center text-gray-500 mb-10">Qaysi tadbir uchun taklifnoma kerak?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoryCounts.map((cat) => (
              <Link key={cat._id} href={`/templates?category=${cat._id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:-translate-y-1 transition-all border border-gray-100 group">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-3 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  {categoryIcons[cat._id as string] || <Sparkles className="w-5 h-5" />}
                </div>
                <div className="font-medium text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                  {CATEGORY_LABELS[cat._id as string] || cat._id}
                </div>
                <div className="text-xs text-gray-400 mt-1">{cat.count} ta</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Nima uchun Invitify?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center p-6">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Qanday ishlaydi?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Shablon tanlang", desc: "18+ shablon ichidan o'zingizga yoqqanini tanlang" },
              { step: "02", title: "Ma'lumot kiriting", desc: "Tadbir ma'lumotlarini to'ldiring" },
              { step: "03", title: "To'lov qiling", desc: "Telegram orqali menejer bilan bog'laning" },
              { step: "04", title: "Ulashing!", desc: "Havolani mehmonlarga yuboring" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-black text-purple-200 mb-3">{item.step}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Bugunoq boshlang</h2>
          <p className="text-gray-500 mb-8">Ro'yxatdan o'ting va birinchi taklifnomangizni yarating.</p>
          <Link href={session ? "/templates" : "/auth/register"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2">
            Bepul boshlash <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <div className="font-semibold text-gray-600">✨ Invitify</div>
          <div className="flex gap-6">
            <Link href="/templates" className="hover:text-gray-600">Shablonlar</Link>
            <Link href="/auth/login" className="hover:text-gray-600">Kirish</Link>
            <a href={`https://t.me/${(process.env.NEXT_PUBLIC_TELEGRAM_MANAGER || "invitify_manager").replace("@","")}`} target="_blank" rel="noopener noreferrer" className="hover:text-gray-600">Telegram</a>
          </div>
          <div>© 2024 Invitify. Barcha huquqlar himoyalangan.</div>
        </div>
      </footer>
    </div>
  )
}
