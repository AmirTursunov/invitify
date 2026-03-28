// src/app/admin/layout.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, ShoppingBag, Users, FileText, Settings, Sparkles, BarChart3 } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    redirect("/dashboard")
  }

  const navItems = [
    { href: "/admin", label: "Bosh sahifa", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Buyurtmalar", icon: ShoppingBag },
    { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
    { href: "/admin/invitations", label: "Taklifnomalar", icon: FileText },
    { href: "/admin/templates", label: "Shablonlar", icon: Settings },
    { href: "/admin/stats", label: "Statistika", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-purple-600">
            <Sparkles className="w-4 h-4" />
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
