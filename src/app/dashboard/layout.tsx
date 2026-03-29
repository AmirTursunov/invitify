// src/app/dashboard/layout.tsx
import { auth, signOut } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LogOut, Sparkles } from "lucide-react"
import { SidebarNav, MobileNav } from "./Navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/auth/login?redirect=/dashboard")

  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role as string)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-purple-600">
            <Sparkles className="w-5 h-5" />
            Invitify
          </Link>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {session.user.name || "Foydalanuvchi"}
              </div>
              <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
            </div>
          </div>
        </div>

        <SidebarNav isAdmin={isAdmin} />

        <div className="p-4 border-t border-gray-100">
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <Link href="/" className="font-bold text-purple-600 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Invitify
          </Link>
          <MobileNav isAdmin={isAdmin} />
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
