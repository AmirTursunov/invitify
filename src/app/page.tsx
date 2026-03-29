// src/app/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { CATEGORY_LABELS } from "@/types";
import {
  Sparkles,
  Star,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Heart,
  Music,
  Briefcase,
  GraduationCap,
  Baby,
  Trophy,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  WEDDING: <Heart className="w-5 h-5" />,
  BIRTHDAY: <Sparkles className="w-5 h-5" />,
  CONCERT: <Music className="w-5 h-5" />,
  MEETING: <Briefcase className="w-5 h-5" />,
  CORPORATE: <Briefcase className="w-5 h-5" />,
  GRADUATION: <GraduationCap className="w-5 h-5" />,
  BABY_SHOWER: <Baby className="w-5 h-5" />,
  SPORTS: <Trophy className="w-5 h-5" />,
};

export default async function HomePage() {
  const session = await auth();
  const db = await getDb();

  const [templateCount, categoryCounts] = await Promise.all([
    db.collection("templates").countDocuments({ isActive: true }),
    db
      .collection("templates")
      .aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
  ]);

  const stats = [
    { label: "Ommabop Shablonlar", value: `${templateCount}+` },
    { label: "Mavjud Kategoriyalar", value: `${categoryCounts.length}` },
    { label: "Faol foydalanuvchilar", value: "500+" },
    { label: "Taklifnomalar yaratildi", value: "2000+" },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Tez yaratish",
      desc: "Bir necha daqiqada professional taklifnoma yarating.",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Ajoyib shablonlar",
      desc: "To'y, tug'ilgan kun, meeting va boshqa tadbirlar uchun mukammal dizayn.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Onlayn ulashish",
      desc: "Dunyodagi istalgan odam qulaylik bilan ko'ra oladi.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Ishonchli to'lov",
      desc: "Menejer bilan to'g'ridan-to'g'ri ishonchli aloqa va to'lov tiziimi.",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      {/* --- Responsive Modern Animated Background --- */}
      <div className="absolute top-0 left-0 w-full h-[900px] md:h-[800px] overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50 via-white to-transparent"></div>

        {/* Animated Blobs using robust standard Tailwind classes */}
        <div className="absolute -top-20 -left-20 w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-purple-400/30 blur-3xl animate-pulse"></div>
        <div
          className="absolute top-40 right-[-100px] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-pink-400/30 blur-3xl animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-80 left-[20%] w-[400px] md:w-[700px] h-[400px] md:h-[700px] rounded-full bg-indigo-400/20 blur-3xl animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "4s" }}
        ></div>

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf62a_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf62a_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_20%,#000_70%,transparent_100%)]"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
            Invitify
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link
              href="/templates"
              className="hover:text-purple-600 transition-colors"
            >
              Shablonlar
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-lg shadow-gray-900/20"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-bold text-gray-600 hover:text-purple-600"
                >
                  Kirish
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-600/30 transition-all hover:-translate-y-0.5"
                >
                  Boshlash
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-md border border-purple-100 text-purple-700 px-5 py-2 rounded-full text-sm font-bold mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            O'zbekistondagi #1 raqamli taklifnoma platformasi
          </div>
          <h1 className="text-[9vw] leading-tight sm:text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight mb-8">
            Taklifnomangizni <br />
            <span className="relative inline-block pb-2">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600">
                mukammal qiling
              </span>
              <svg
                className="absolute w-full h-8 -bottom-4 left-0 text-purple-200 -z-10"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 10 Q 50 20 100 10"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="text-md sm:text-2xl text-gray-600 max-w-2xl mx-auto mb-12 font-medium">
            To'y, tug'ilgan kun, meeting va boshqa muhim tadbirlar uchun
            zamonaviy va professional taklifnomalarni onlayn yarating.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/templates"
              className="w-full sm:w-auto bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-900/20 group"
            >
              Shablon tanlash{" "}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-500 mt-4 sm:mt-0">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-xs"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <span>500+ baxtli insonlar</span>
            </div>
          </div>
        </div>

        {/* Stats Glass Section */}
        <div className="max-w-6xl mx-auto mt-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-3xl text-center shadow-xl shadow-purple-900/5 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600">
                  {stat.value}
                </div>
                <div className="text-sm font-bold text-gray-500 mt-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Feature Section with Premium Layout */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
              Vaqtingizni tejaymiz, <br /> sifati esa a'lo
            </h2>
            <p className="text-lg text-gray-500 font-medium">
              Barcha zaruriy funksiyalar sizning talablaringiz asosida
              ishlangan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-600 group-hover:to-pink-600 transition-colors rounded-2xl flex items-center justify-center text-purple-600 group-hover:text-white mb-6">
                  {f.icon}
                </div>
                <h3 className="font-extrabold text-xl text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Modern Grid */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Kategoriyalar
              </h2>
              <p className="text-lg text-gray-500 font-medium">
                Qaysi tadbir bo'lishidan qat'iy nazar o'zingizga yoqgan dizaynni
                izlang
              </p>
            </div>
            <Link
              href="/templates"
              className="shrink-0 text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1 group"
            >
              Barchasini ko'rish{" "}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryCounts.map((cat) => (
              <Link
                key={cat._id}
                href={`/templates?category=${cat._id}`}
                className="bg-gray-50 hover:bg-purple-50 rounded-[2rem] p-6 text-center hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600 group-hover:scale-110 transition-transform">
                  {categoryIcons[cat._id as string] || (
                    <Sparkles className="w-6 h-6" />
                  )}
                </div>
                <div className="font-extrabold text-sm text-gray-900 mb-1">
                  {CATEGORY_LABELS[cat._id as string] || cat._id}
                </div>
                <div className="text-xs font-bold text-gray-400">
                  {cat.count} ta maxsus
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gray-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900 to-gray-900 pointer-events-none"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h2 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tight">
            Tayyormisiz?
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-medium max-w-2xl mx-auto">
            Minglab insonlar tanlagan platformada o'zingizning birinchi noyob
            taklifnomangizni bugunoq sinab ko'ring.
          </p>
          <Link
            href={session ? "/templates" : "/auth/register"}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
          >
            Hoziroq bepul boshlang <ChevronRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      <footer className="relative z-10 bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-black text-xl text-gray-900">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Invitify{" "}
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md ml-2">
              PRO
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-semibold text-sm">
            <Link
              href="/templates"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Shablonlar
            </Link>
            <Link
              href="/auth/login"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Platformaga kirish
            </Link>
            <a
              href={`https://t.me/${(process.env.NEXT_PUBLIC_TELEGRAM_MANAGER || "invitify_manager").replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
            >
              Telegram Yordam
            </a>
          </div>
          <div className="text-sm font-semibold text-gray-400">
            © 2024 Invitify. Barcha huquqlar himoyalangan.
          </div>
        </div>
      </footer>
    </div>
  );
}
