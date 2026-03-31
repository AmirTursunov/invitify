// src/app/admin/templates/page.tsx
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { redirect } from "next/navigation";
import { CATEGORY_LABELS, type TemplateStyles } from "@/types";
import { Crown } from "lucide-react";
import TemplateToggle from "@/components/ui/template-toggle";

export default async function AdminTemplatesPage() {
  const session = await auth();
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string))
    redirect("/dashboard");
  const db = await getDb();
  const templates = await db
    .collection("templates")
    .find({})
    .sort({ category: 1, sortOrder: 1 })
    .toArray();

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Shablonlar ({templates.length})
      </h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Shablon
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Kategoriya
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Narx
              </th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                Holat
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {templates.map((template) => {
              const styles = template.styles as TemplateStyles;
              const id = template._id.toString();
              return (
                <tr key={id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ background: styles.primaryColor || "#7C3AED" }}
                      >
                        {template.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-1">
                          {template.name}
                          {template.isPremium && (
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {template.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">
                      {CATEGORY_LABELS[template.category] || template.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">
                    {template.price === 0 ? (
                      <span className="text-green-600">Bepul</span>
                    ) : (
                      `${template.price.toLocaleString()} so'm`
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <TemplateToggle
                      templateId={id}
                      isActive={template.isActive}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
