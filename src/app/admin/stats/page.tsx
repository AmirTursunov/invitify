// src/app/admin/stats/page.tsx
import { auth } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  ShoppingBag,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from "lucide-react";
import { CATEGORY_LABELS, type DbTemplate } from "@/types";

export const metadata = { title: "Admin — Statistika" };

export default async function AdminStatsPage() {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string))
    redirect("/dashboard");
  const db = await getDb();

  const [totalRevenueAgg, monthRevenueAgg, ordersByStatus, topTemplatesRaw] =
    await Promise.all([
      db
        .collection("orders")
        .aggregate([
          { $match: { status: "CONFIRMED" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      db
        .collection("orders")
        .aggregate([
          {
            $match: {
              status: "CONFIRMED",
              confirmedAt: {
                $gte: new Date(
                  new Date().getFullYear(),
                  new Date().getMonth(),
                  1,
                ),
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      db
        .collection("orders")
        .aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])
        .toArray(),
      db
        .collection("invitations")
        .aggregate([
          { $group: { _id: "$templateId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ])
        .toArray(),
    ]);

  const totalRevenue = totalRevenueAgg[0]?.total || 0;
  const monthRevenue = monthRevenueAgg[0]?.total || 0;
  const maxCount = topTemplatesRaw[0]?.count || 1;

  const templateIds = topTemplatesRaw.map((t) => t._id).filter(Boolean);
  const templatesRaw = await db
    .collection("templates")
    .find({
      $or: [
        {
          _id: {
            $in: templateIds
              .map((id: string) => {
                try {
                  return new ObjectId(id);
                } catch {
                  return null;
                }
              })
              .filter(Boolean),
          },
        },
        {
          _id: {
            $in: templateIds.filter(
              (id: string) => typeof id === "string" && id.length !== 24,
            ),
          } as any,
        },
      ],
    })
    .toArray();
  const templates = templatesRaw as unknown as DbTemplate[];
  const templateMap = Object.fromEntries(
    templates.map((t) => [t._id?.toString() || "", t]),
  );

  const statusLabels: Record<string, string> = {
    PENDING: "Kutilmoqda",
    PAYMENT_SENT: "To'lov yuborildi",
    CONFIRMED: "Tasdiqlandi",
    REJECTED: "Rad etildi",
    REFUNDED: "Qaytarildi",
  };
  const statusColors: Record<string, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-700 border-yellow-200 shadow-yellow-100/30",
    PAYMENT_SENT:
      "bg-blue-100 text-blue-700 border-blue-200 shadow-blue-100/30",
    CONFIRMED:
      "bg-green-100 text-green-700 border-green-200 shadow-green-100/30",
    REJECTED: "bg-red-100 text-red-700 border-red-200 shadow-red-100/30",
    REFUNDED: "bg-gray-100 text-gray-600 border-gray-200 shadow-gray-100/30",
  };
  const totalOrdersCount = ordersByStatus.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-purple-100 rounded-2xl text-purple-600 border border-purple-200 shadow-sm">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Statistika va Tahlil
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Platformaning umumiy daromadi va foydalanuvchilar faolligi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <TrendingUp className="w-24 h-24 text-gray-900" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 text-green-600 rounded-lg shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Umumiy tushum
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-gray-900">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-gray-400">so'm</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 w-fit px-3 py-1.5 rounded-full border border-green-100 shadow-sm shadow-green-100/50">
            <ArrowUpRight className="w-3 h-3" /> Jami tasdiqlangan to'lovlar
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[32px] p-8 border border-purple-200 shadow-lg shadow-purple-100 relative overflow-hidden group">
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Calendar className="w-48 h-48 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-white/10 text-white rounded-lg shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white/70 uppercase tracking-widest">
              Shu oy tushumi
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">
              {monthRevenue.toLocaleString()}
            </span>
            <span className="text-lg font-bold text-white/50">so'm</span>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white bg-white/20 w-fit px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
            <ArrowUpRight className="w-3 h-3" />{" "}
            {new Date().toLocaleString("uz-UZ", { month: "long" })} oyi
            hisobidan
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-gray-900">Buyurtmalar holati</h2>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest border border-gray-100 px-3 py-1 rounded-lg">
              Jami: {totalOrdersCount}
            </div>
          </div>
          <div className="space-y-6">
            {ordersByStatus.map((item) => (
              <div key={item._id} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-black tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm ${statusColors[item._id] || "bg-gray-100 text-gray-600 border-gray-200"}`}
                  >
                    {statusLabels[item._id] || item._id}
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {item.count}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden p-0.5 border border-gray-100 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-purple-200"
                    style={{
                      width: `${Math.min((item.count / totalOrdersCount) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-gray-900">
                Eng ommabop shablonlar
              </h2>
            </div>
          </div>
          <div className="space-y-5">
            {topTemplatesRaw.map((item, index) => {
              const template = templateMap[item._id];
              return (
                <div
                  key={item._id}
                  className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm border
                    ${
                      index === 0
                        ? "bg-amber-100 text-amber-600 border-amber-200 shadow-amber-100/50"
                        : index === 1
                          ? "bg-slate-100 text-slate-500 border-slate-200 shadow-slate-100/50"
                          : index === 2
                            ? "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50/50"
                            : "bg-gray-50 text-gray-400 border-gray-100 shadow-gray-50/30"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                      {template?.name || "Noma'lum"}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {CATEGORY_LABELS[template?.category || ""] ||
                        template?.category ||
                        "Boshqa"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-900">
                        {item.count}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        ishlatgan
                      </span>
                    </div>
                    <div className="w-24 h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(item.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
