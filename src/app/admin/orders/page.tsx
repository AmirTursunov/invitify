// src/app/admin/orders/page.tsx
import { auth } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminOrderActions from "@/components/ui/admin-order-actions";
import {
  ORDER_STATUS_LABELS,
  type DbOrder,
  type DbUser,
  type DbInvitation,
  type DbTemplate,
} from "@/types";
import { Search, Filter, Calendar, CreditCard, User, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}
export const metadata = { title: "Admin — Buyurtmalar" };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string))
    redirect("/dashboard");

  const { status, page: pageParam, q: query } = await searchParams;
  const page = Number(pageParam || 1);
  const limit = 20;
  const db = await getDb();

  // Combine filters
  let filter: any = {};
  if (status) filter.status = status;

  if (query) {
    const searchConditions: any[] = [];
    
    // 1. Search by Order ID
    try {
      if (query.length === 24) {
        searchConditions.push({ _id: new ObjectId(query) });
      } else {
        searchConditions.push({ _id: query }); // Could be a string ID
      }
    } catch {}

    // 2. Search by User Email
    const matchedUsers = await db.collection("users").find({
      email: { $regex: query, $options: "i" }
    }).project({ _id: 1 }).toArray();
    
    if (matchedUsers.length > 0) {
      const uids = matchedUsers.map(u => u._id.toString());
      const uoids = matchedUsers.map(u => u._id);
      searchConditions.push({ userId: { $in: [...uids, ...uoids] } });
    }

    // 3. Search by Invitation Title
    const matchedInvitations = await db.collection("invitations").find({
      title: { $regex: query, $options: "i" }
    }).project({ _id: 1 }).toArray();

    if (matchedInvitations.length > 0) {
      const iids = matchedInvitations.map(i => i._id.toString());
      const ioids = matchedInvitations.map(i => i._id);
      searchConditions.push({ invitationId: { $in: [...iids, ...ioids] } });
    }

    if (searchConditions.length > 0) {
      filter = { ...filter, $or: searchConditions };
    }
  }

  const [ordersRaw, total] = await Promise.all([
    db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("orders").countDocuments(filter),
  ]);
  const orders = ordersRaw as unknown as DbOrder[];

  // Robust User fetching
  const userIdsStrings = [...new Set(orders.map(o => o.userId?.toString()).filter(Boolean))] as string[];
  const userIdsObjectIds = userIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];

  const usersRaw = await db.collection("users").find({
    $or: [
      { _id: { $in: userIdsStrings } as any },
      { _id: { $in: userIdsObjectIds } }
    ]
  }).toArray();
  const users = usersRaw as unknown as DbUser[];
  const userMap = Object.fromEntries(
    users.map((u) => [u._id?.toString() || "", u]),
  );

  // Robust Invitation and Template fetching
  const invIdsStrings = [...new Set(orders.map(o => o.invitationId?.toString()).filter(Boolean))] as string[];
  const invIdsObjectIds = invIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];

  const invitationsRaw = await db.collection("invitations").find({
    $or: [
      { _id: { $in: invIdsStrings } as any },
      { _id: { $in: invIdsObjectIds } }
    ]
  }).toArray();
  const invitations = invitationsRaw as unknown as DbInvitation[];

  const templateIdsStrings = [...new Set(invitations.map(i => i.templateId?.toString()).filter(Boolean))] as string[];
  const templateIdsObjectIds = templateIdsStrings.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) as ObjectId[];

  const templatesRaw = await db.collection("templates").find({
    $or: [
      { _id: { $in: templateIdsStrings } as any },
      { _id: { $in: templateIdsObjectIds } }
    ]
  }).toArray();
  const templates = templatesRaw as unknown as DbTemplate[];
  const templateMap = Object.fromEntries(
    templates.map((t) => [t._id?.toString() || "", t]),
  );
  const invMap = Object.fromEntries(
    invitations.map((i) => [
      i._id?.toString() || "",
      { ...i, template: templateMap[i.templateId?.toString() || ""] },
    ]),
  );

  const tabs = [
    { label: "Barchasi", value: "" },
    { label: "Kutilmoqda", value: "PENDING" },
    { label: "To'lov yuborildi", value: "PAYMENT_SENT" },
    { label: "Tasdiqlandi", value: "CONFIRMED" },
    { label: "Rad etildi", value: "REJECTED" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Buyurtmalar boshqaruvi</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Jami {total} ta buyurtma mavjud
          </p>
        </div>
        <form className="relative group w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input
            name="q"
            defaultValue={query}
            type="text"
            placeholder="ID, Email yoki Sarlavha..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all shadow-sm"
          />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-[20px] w-fit overflow-x-auto no-scrollbar border border-gray-200/50">
        {tabs.map((tab) => {
          const isActive = status === tab.value || (!status && !tab.value);
          return (
            <Link
              key={tab.value}
              href={`/admin/orders${tab.value ? `?status=${tab.value}` : ""}${query ? `&q=${query}` : ""}`}
              className={`shrink-0 px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? "bg-white text-purple-600 shadow-sm border border-gray-200/20" : "text-gray-500 hover:text-gray-900 hover:bg-white/50"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-inner">
              <CreditCard className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-black text-xl tracking-tight">
              Buyurtmalar topilmadi
            </p>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Siz tanlagan filtrlar bo'yicha hech qanday natija mavjud emas
            </p>
            <Link href="/admin/orders" className="inline-flex items-center mt-6 text-sm font-bold text-purple-600 bg-purple-50 px-6 py-2.5 rounded-2xl hover:bg-purple-100 transition-colors">
              Filtrlarni tozalash
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {orders.map((order) => {
              const orderId = order._id?.toString() || "";
              const userId = order.userId?.toString() || "";
              const invId = order.invitationId?.toString() || "";
              const user = userMap[userId];
              const inv = invMap[invId];
              const statusInfo = ORDER_STATUS_LABELS[order.status] || {
                label: order.status,
                color: "gray",
              };

              return (
                <div
                  key={orderId}
                  className="p-8 hover:bg-gray-50/50 transition-colors group relative"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 flex-1">
                      {/* User Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-700 font-black border-2 border-white shadow-sm">
                            {user?.name?.charAt(0) ||
                              user?.email?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-gray-900 truncate tracking-tight text-lg">
                              {user?.name || "Ismsiz"}
                            </div>
                            <div className="text-xs text-gray-400 font-bold truncate tracking-tight">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                        {user?.phone && (
                          <div className="flex items-center gap-2.5 text-xs font-black text-gray-500 bg-gray-100 w-fit px-3 py-1.5 rounded-xl">
                            <CreditCard className="w-3.5 h-3.5" /> {user.phone}
                          </div>
                        )}
                      </div>

                      {/* Invitation Info */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                          <Tag className="w-3 h-3" /> Taklifnoma
                        </div>
                        <div className="font-black text-gray-800 text-sm group-hover:text-purple-600 transition-colors">
                          {inv?.title || "Noma'lum taklifnoma"}
                        </div>
                        <div className="inline-flex items-center gap-2 text-[10px] font-black text-purple-600 px-3 py-1 bg-purple-50 rounded-full border border-purple-100 uppercase tracking-widest">
                          {inv?.template?.name || "Shablon"}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-900">
                          <span className="text-2xl font-black tracking-tighter">
                            {order.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                            so'm
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">
                          <Calendar className="w-3.5 h-3.5" />{" "}
                          {new Date(order.createdAt).toLocaleString("uz-UZ")}
                        </div>
                        {order.telegramNote && (
                          <div className="text-[11px] text-blue-700 font-bold bg-blue-50/50 px-3 py-2 rounded-2xl border border-blue-100/50 italic leading-relaxed">
                            "{order.telegramNote}"
                          </div>
                        )}
                        <div className="font-mono text-[9px] text-gray-300 font-medium">
                          ID: <span className="text-gray-400 font-black">{orderId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 shrink-0">
                      <span
                        className={`text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full font-black shadow-sm whitespace-nowrap
                        ${
                          statusInfo.color === "green"
                            ? "bg-green-100 text-green-700 shadow-green-200/50 border border-green-200/50"
                            : statusInfo.color === "yellow"
                              ? "bg-yellow-100 text-yellow-700 shadow-yellow-200/50 border border-yellow-200/50"
                              : statusInfo.color === "blue"
                                ? "bg-blue-100 text-blue-700 shadow-blue-200/50 border border-blue-200/50"
                                : statusInfo.color === "red"
                                  ? "bg-red-100 text-red-700 shadow-red-200/50 border border-red-200/50"
                                  : "bg-gray-100 text-gray-600 shadow-gray-200/50 border border-gray-200/50"
                        }`}
                      >
                        {statusInfo.label}
                      </span>
                      {["PENDING", "PAYMENT_SENT"].includes(order.status) && (
                        <div className="pt-2">
                          <AdminOrderActions orderId={orderId} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {total > limit && (
        <div className="flex items-center justify-center gap-4 mt-12 bg-white px-6 py-4 rounded-[32px] border border-gray-100 w-fit mx-auto shadow-sm">
          <Link
            href={`/admin/orders?page=${page - 1}${status ? `&status=${status}` : ""}${query ? `&q=${query}` : ""}`}
            className={`p-2.5 rounded-2xl transition-all ${page > 1 ? "bg-gray-50 text-gray-900 hover:bg-purple-600 hover:text-white" : "text-gray-200 pointer-events-none"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            {[...Array(Math.ceil(total / limit))].map((_, i) => (
              <Link
                key={i}
                href={`/admin/orders?page=${i + 1}${status ? `&status=${status}` : ""}${query ? `&q=${query}` : ""}`}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all ${page === i + 1 ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                {i + 1}
              </Link>
            ))}
          </div>
          <Link
            href={`/admin/orders?page=${page + 1}${status ? `&status=${status}` : ""}${query ? `&q=${query}` : ""}`}
            className={`p-2.5 rounded-2xl transition-all ${page * limit < total ? "bg-gray-50 text-gray-900 hover:bg-purple-600 hover:text-white" : "text-gray-200 pointer-events-none"}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
