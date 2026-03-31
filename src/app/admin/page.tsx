// src/app/admin/page.tsx
import { auth } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Users, FileText, TrendingUp, ArrowRight, Clock, Plus, BarChart3, Activity, AlertCircle, Sparkles } from "lucide-react";
import { ORDER_STATUS_LABELS, type DbUser, type DbInvitation, type DbOrder, type DbTemplate } from "@/types";

export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string)) redirect("/dashboard");

  const db = await getDb();
  const [totalUsers, totalInvitations, totalOrders, pendingCount, revenueAgg, recentOrdersRaw] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("invitations").countDocuments(),
    db.collection("orders").countDocuments(),
    db.collection("orders").countDocuments({ status: { $in: ["PENDING", "PAYMENT_SENT"] } }),
    db.collection("orders").aggregate([{ $match: { status: "CONFIRMED" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]).toArray(),
    db.collection("orders").find({ status: { $in: ["PENDING", "PAYMENT_SENT"] } }).sort({ createdAt: -1 }).limit(10).toArray(),
  ]);

  const recentOrders = recentOrdersRaw as unknown as DbOrder[];
  const totalRevenue = revenueAgg[0]?.total || 0;

  // Robust User fetching
  const userIdsStrings = [...new Set(recentOrders.map(o => o.userId?.toString()).filter(Boolean))] as string[];
  const userIdsObjectIds = userIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];
  
  const usersRaw = await db.collection("users").find({
    $or: [
      { _id: { $in: userIdsStrings } as any },
      { _id: { $in: userIdsObjectIds } }
    ]
  }).toArray();
  const users = usersRaw as unknown as DbUser[];
  const userMap = Object.fromEntries(users.map(u => [u._id?.toString() || "", u]));

  // Robust Invitation fetching
  const invIdsStrings = [...new Set(recentOrders.map(o => o.invitationId?.toString()).filter(Boolean))] as string[];
  const invIdsObjectIds = invIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];

  const invitationsRaw = await db.collection("invitations").find({
    $or: [
      { _id: { $in: invIdsStrings } as any },
      { _id: { $in: invIdsObjectIds } }
    ]
  }).toArray();
  const invitations = invitationsRaw as unknown as DbInvitation[];

  // Robust Template fetching
  const templateIdsStrings = [...new Set(invitations.map(i => i.templateId?.toString()).filter(Boolean))] as string[];
  const templateIdsObjectIds = templateIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];

  const templatesRaw = await db.collection("templates").find({
    $or: [
      { _id: { $in: templateIdsStrings } as any },
      { _id: { $in: templateIdsObjectIds } }
    ]
  }).toArray();
  const templates = templatesRaw as unknown as DbTemplate[];
  const templateMap = Object.fromEntries(templates.map(t => [t._id?.toString() || "", t]));
  const invMap = Object.fromEntries(invitations.map(i => [i._id?.toString() || "", { ...i, template: templateMap[i.templateId?.toString() || ""] }]));

  const stats = [
    { label: "Foydalanuvchilar", value: totalUsers.toLocaleString(), icon: Users, href: "/admin/users", color: "blue" },
    { label: "Taklifnomalar", value: totalInvitations.toLocaleString(), icon: FileText, href: "/admin/invitations", color: "purple" },
    { label: "Jami buyurtmalar", value: totalOrders.toLocaleString(), icon: ShoppingBag, href: "/admin/orders", color: "orange" },
    { label: "Kutilmoqda", value: pendingCount.toLocaleString(), icon: Clock, href: "/admin/orders?status=PENDING", color: "red" },
    { label: "Jami tushum", value: `${totalRevenue.toLocaleString()}`, suffix: "so'm", icon: TrendingUp, href: "/admin/stats", color: "green" },
  ];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100/50 text-blue-700",
    purple: "bg-purple-100/50 text-purple-700",
    orange: "bg-orange-100/50 text-orange-700",
    red: "bg-red-100/50 text-red-700",
    green: "bg-green-100/50 text-green-700",
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" /> Platformaning umumiy holati va so'nggi harakatlar
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/templates" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm">
            <Plus className="w-4 h-4" /> Shablon qo'shish
          </Link>
          <Link href="/admin/stats" className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-2xl text-sm font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-200">
            <BarChart3 className="w-4 h-4" /> To'liq statistika
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group bg-white rounded-[32px] p-6 border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${colorClasses[stat.color]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
              {stat.suffix && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.suffix}</span>}
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 group-hover:text-gray-600 transition-colors">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Tasdiqlash kutilmoqda</h2>
                  <p className="text-xs text-gray-400 font-medium">Jami {pendingCount} ta buyurtma ko'rib chiqilishi kerak</p>
                </div>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5 uppercase tracking-widest group px-3 py-1.5 bg-purple-50 rounded-full transition-all">
                Hammasi <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                  <Clock className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-400 font-bold">Kutilayotgan buyurtmalar yo'q</p>
                <p className="text-gray-300 text-xs mt-1 font-medium">Hozircha hamma buyurtmalar ko'rib chiqilgan</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const orderId = order._id?.toString() || ""
                  const userId = order.userId?.toString() || ""
                  const invId = order.invitationId?.toString() || ""
                  const user = userMap[userId]
                  const inv = invMap[invId]
                  const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: "gray" }
                  
                  return (
                    <Link key={orderId} href={`/admin/orders`}
                      className="flex items-center justify-between p-6 hover:bg-gray-50/50 transition-colors group">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-black border border-white shadow-sm shrink-0">
                          {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                            {user?.name || user?.email || "Ismsiz foydalanuvchi"}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                            <span className="text-purple-500 font-black">{inv?.template?.name || "Shablon"}</span> 
                            <span className="text-gray-200">•</span>
                            <span className="truncate">{inv?.title || "Taklifnoma"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="font-black text-gray-900 whitespace-nowrap">{(order.amount).toLocaleString()} <span className="text-[10px] text-gray-400 font-bold">SO'M</span></div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-0.5">{new Date(order.createdAt).toLocaleDateString("uz-UZ")}</div>
                        </div>
                        <span className={`text-[9px] uppercase tracking-[0.15em] px-3 py-1.5 rounded-full font-black shadow-sm
                          ${statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700 shadow-yellow-100/30" : "bg-blue-100 text-blue-700 shadow-blue-100/30"}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-[32px] p-8 text-white shadow-xl shadow-purple-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              Tezkor havolalar
            </h3>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              {[
                { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
                { href: "/admin/invitations", label: "Taklifnomalar", icon: FileText },
                { href: "/admin/templates", label: "Yangi shablon", icon: Plus },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group/item border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold tracking-tight">{link.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-gray-900 font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em] text-xs">
              Platforma holati
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-400">Tizim holati</span>
                <span className="flex items-center gap-2 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ON-LINE
                </span>
              </div>
              <div className="w-full h-px bg-gray-50" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-400 text-left">Oxirgi yangilanish</span>
                <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  {new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="mt-6 p-4 bg-red-50/50 rounded-2xl border border-red-50 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-red-600 font-bold leading-relaxed uppercase tracking-tighter">
                  Eslatma: Tasdiqlanmagan to'lovlar 24 soatdan so'ng avtomatik bekor qilinadi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
