import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { FileText, ShoppingBag, Eye } from "lucide-react";
import { INVITATION_STATUS_LABELS, type TemplateStyles } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const userId = session.user.id as string;
  const db = await getDb();

  const invitationsCol = db.collection<any>("invitations");
  const ordersCol = db.collection<any>("orders");
  const templatesCol = db.collection<any>("templates");

  const [invCount, orderCount, recentInvRaw, recentOrdersRaw, viewAgg] =
    await Promise.all([
      invitationsCol.countDocuments({ userId }),
      ordersCol.countDocuments({ userId }),
      invitationsCol
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      ordersCol.find({ userId }).sort({ createdAt: -1 }).limit(3).toArray(),
      invitationsCol
        .aggregate([
          { $match: { userId } },
          { $group: { _id: null, total: { $sum: "$viewCount" } } },
        ])
        .toArray(),
    ]);

  const totalViews = viewAgg?.[0]?.total || 0;

  // ✅ templateIds safe
  const templateIds = recentInvRaw
    .map((i) => {
      try {
        return new ObjectId(i.templateId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const templates = templateIds.length
    ? await templatesCol.find({ _id: { $in: templateIds } }).toArray()
    : [];

  const templateMap: Record<string, any> = {};
  templates.forEach((t) => {
    templateMap[t._id.toString()] = t;
  });

  // ✅ orders -> invitations
  const orderInvIds = recentOrdersRaw
    .map((o) => {
      try {
        return new ObjectId(o.invitationId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const orderInvitations = orderInvIds.length
    ? await invitationsCol.find({ _id: { $in: orderInvIds } }).toArray()
    : [];

  const orderInvMap: Record<string, any> = {};
  orderInvitations.forEach((i) => {
    orderInvMap[i._id.toString()] = i;
  });

  const orderTemplateIds = orderInvitations
    .map((i) => {
      try {
        return new ObjectId(i.templateId);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const orderTemplates = orderTemplateIds.length
    ? await templatesCol.find({ _id: { $in: orderTemplateIds } }).toArray()
    : [];

  const orderTemplateMap: Record<string, any> = {};
  orderTemplates.forEach((t) => {
    orderTemplateMap[t._id.toString()] = t;
  });

  const recentInvitations = recentInvRaw.map((i) => ({
    ...i,
    id: i._id.toString(),
    template: templateMap[i.templateId] || null,
  }));

  const recentOrders = recentOrdersRaw.map((o) => {
    const invitation = orderInvMap[o.invitationId];

    return {
      ...o,
      id: o._id.toString(),
      invitation: invitation
        ? {
            ...invitation,
            template: orderTemplateMap[invitation.templateId] || null,
          }
        : null,
    };
  });

  const stats = [
    {
      label: "Taklifnomalar",
      value: invCount,
      icon: FileText,
      href: "/dashboard/invitations",
    },
    {
      label: "Buyurtmalar",
      value: orderCount,
      icon: ShoppingBag,
      href: "/dashboard/orders",
    },
    {
      label: "Jami ko'rishlar",
      value: totalViews,
      icon: Eye,
      href: "/dashboard/invitations",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">
        Xush kelibsiz, {session.user.name?.split(" ")[0] || "User"} 👋
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="p-4 border rounded-xl">
              <stat.icon />
              <div>{stat.value}</div>
              <div>{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div>
        {recentInvitations.map((inv) => {
          const styles = inv.template?.styles as TemplateStyles | undefined;

          return (
            <div key={inv.id} className="p-3 border mb-2">
              <div>{inv.title}</div>
              <div>{inv.template?.name}</div>
              <div>{inv.viewCount}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
