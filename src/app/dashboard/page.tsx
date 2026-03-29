import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { 
  FileText, 
  ShoppingBag, 
  Eye, 
  Plus, 
  Calendar, 
  ExternalLink, 
  Edit3, 
  TrendingUp,
  Inbox
} from "lucide-react";
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

  // templateIds safe mapping
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

  // orders -> invitations safe mapping
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
      color: "from-purple-500 to-indigo-500",
      bgClass: "bg-purple-50 text-purple-600",
    },
    {
      label: "Buyurtmalar",
      value: orderCount,
      icon: ShoppingBag,
      href: "/dashboard/orders",
      color: "from-blue-500 to-cyan-500",
      bgClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Jami ko'rishlar",
      value: totalViews,
      icon: Eye,
      href: "/dashboard/invitations",
      color: "from-emerald-500 to-teal-500",
      bgClass: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-gray-500 font-medium mb-1">Xush kelibsiz qaytdingiz,</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {session.user.name?.split(" ")[0] || "Mehmon"} <span className="inline-block hover:animate-ping duration-1000 origin-bottom">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 max-w-md line-clamp-2 text-sm leading-relaxed">
            Taklifnomalaringiz va statistikalarini ushbu boshqaruv panelida kuzatib boring.
          </p>
        </div>
        
        <Link 
          href="/dashboard/create" 
          className="relative z-10 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] shadow-xl hover:shadow-2xl shadow-gray-900/20 active:scale-95 group shrink-0"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Yangi yaratish
        </Link>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Link key={stat.label} href={stat.href} className="group block">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl ${stat.bgClass} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {i === 2 && <TrendingUp className="w-5 h-5 text-emerald-500 animate-pulse" />}
              </div>
              <div>
                <h3 className="text-4xl font-black text-gray-900 mb-1">{stat.value.toLocaleString()}</h3>
                <p className="text-gray-500 font-medium flex items-center justify-between">
                  {stat.label}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold uppercase tracking-wider text-gray-400">Ko'rish</span>
                </p>
              </div>
              <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Invitations Section */}
      <div>
        <div className="flex items-center justify-between mb-6 px-1">
          <h2 className="text-xl font-bold text-gray-900">So'nggi taklifnomalar</h2>
          <Link href="/dashboard/invitations" className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline">
            Barchasini ko'rish →
          </Link>
        </div>

        {recentInvitations.length > 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {recentInvitations.map((inv) => {
                const styles = inv.template?.styles as TemplateStyles | undefined;
                const templateColor = styles?.primaryColor || "#8b5cf6";
                const dateRaw = new Date(inv.createdAt);
                let dateFormatted = "Sana kiritilmagan";
                try {
                  dateFormatted = dateRaw.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
                } catch(e) {}

                return (
                  <div key={inv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                    
                    <div className="flex items-center gap-4">
                      {/* Avatar / Icon based on template color */}
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/5" 
                        style={{ backgroundColor: `${templateColor}15`, color: templateColor }}
                      >
                        <FileText className="w-6 h-6" />
                      </div>
                      
                      {/* Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1">{inv.title || "Nomsiz taklifnoma"}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {dateFormatted}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {inv.viewCount || 0} ta</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                      <div className="px-3 py-1 rounded-full text-xs font-bold border" style={{ backgroundColor: `${templateColor}10`, color: templateColor, borderColor: `${templateColor}30` }}>
                        {inv.template?.name || "Kustom Shablon"}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/dashboard/invitations/${inv.id}`}
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <a 
                          href={`/invite/${inv.slug || inv.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-black transition-colors"
                          title="Jonli ko'rish"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-purple-600 opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hali taklifnomalar yo'q</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              O'zingizning birinchi ajoyib taklifnomangizni bugun yarating! Bu atigi bir necha daqiqa vaqt oladi.
            </p>
            <Link 
              href="/dashboard/create" 
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Taklifnoma yaratish
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
