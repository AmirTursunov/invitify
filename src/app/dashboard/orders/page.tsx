// src/app/dashboard/orders/page.tsx
import { auth } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";
import Link from "next/link";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { ORDER_STATUS_LABELS } from "@/types";

export const metadata = { title: "Buyurtmalarim" };

export default async function OrdersPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const db = await getDb();

  const ordersRaw = await db
    .collection("orders")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  const invIds = ordersRaw
    .map((o) => {
      try {
        return new ObjectId(o.invitationId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  const invitations = await db
    .collection("invitations")
    .find({ _id: { $in: invIds } })
    .toArray();
  const templateIds = [...new Set(invitations.map((i) => i.templateId))];
  const templates = await db
    .collection("templates")
    .find({
      _id: {
        $in: templateIds
          .map((id) => {
            try {
              return new ObjectId(id);
            } catch {
              return null;
            }
          })
          .filter(Boolean),
      },
    })
    .toArray();
  const templateMap = Object.fromEntries(
    templates.map((t) => [t._id.toString(), t]),
  );
  const invMap = Object.fromEntries(
    invitations.map((i) => [
      i._id.toString(),
      { ...i, template: templateMap[i.templateId] },
    ]),
  );
  const orders = ordersRaw.map((o) => ({
    ...o,
    id: o._id.toString(),
    invitation: invMap[o.invitationId],
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Buyurtmalarim</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} ta buyurtma
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Buyurtma yo'q
          </h3>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors mt-4"
          >
            Taklifnoma yaratish
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS_LABELS[order.status] || {
              label: order.status,
              color: "gray",
            };
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="font-semibold text-gray-800">
                      {order.invitation?.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {order.invitation?.template?.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">
                      ID: {order.id.slice(0, 16)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleString("uz-UZ")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {(order.amount / 100).toLocaleString()} so'm
                    </div>
                    <span
                      className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusInfo.color === "green" ? "bg-green-100 text-green-700" : statusInfo.color === "yellow" ? "bg-yellow-100 text-yellow-700" : statusInfo.color === "blue" ? "bg-blue-100 text-blue-700" : statusInfo.color === "red" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                {order.status === "PENDING" && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm font-semibold text-amber-800 mb-2">
                      ⏳ To'lov kutilmoqda
                    </p>
                    <p className="text-sm text-amber-700">
                      Karta:{" "}
                      <span className="font-mono font-bold">
                        {process.env.NEXT_PUBLIC_CARD_NUMBER ||
                          "8600 **** **** ****"}
                      </span>
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Telegram:{" "}
                      <a
                        href={`https://t.me/${(process.env.NEXT_PUBLIC_TELEGRAM_MANAGER || "invitify_manager").replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline"
                      >
                        @
                        {(
                          process.env.NEXT_PUBLIC_TELEGRAM_MANAGER ||
                          "invitify_manager"
                        ).replace("@", "")}
                      </a>
                    </p>
                    <p className="text-xs text-amber-600 mt-2 font-mono bg-amber-100 p-2 rounded">
                      Izoh: Buyurtma ID: {order.id}
                    </p>
                  </div>
                )}
                {order.status === "CONFIRMED" && order.invitation?.slug && (
                  <div className="mt-4">
                    <Link
                      href={`/invite/${order.invitation.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Taklifnomani ko'rish
                    </Link>
                  </div>
                )}
                {order.adminNote && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                    📝 {order.adminNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
