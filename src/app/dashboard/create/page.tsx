"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import type { Template, TemplateFields, TemplateStyles } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

import InvitationEditor from "@/components/invitations/InvitationEditor";

export default function CreateInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("template");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "fill">(
    templateIdParam ? "fill" : "select",
  );
  const [fetchingTemplates, setFetchingTemplates] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => {
        const list = d.templates || [];
        setTemplates(list);
        if (templateIdParam) {
          const found = list.find((t: Template) => t.id === templateIdParam);
          if (found) setSelectedTemplate(found);
        }
        setFetchingTemplates(false);
      });
  }, [templateIdParam]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setStep("fill");
  };

  const handleSubmit = async ({ data, title }: any) => {
    if (!selectedTemplate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title,
          data,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        router.push(`/dashboard/invitations/${resData.invitation.id}`);
      } else {
        alert(resData.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingTemplates) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Shablon tanlang</h1>
            <p className="text-sm text-gray-500">
              Quyidagi shablonlardan birini tanlang
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => {
            const styles = (template.styles || {}) as TemplateStyles;
            const color = styles?.primaryColor || "#7C3AED";
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="bg-white rounded-2xl border hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden group flex flex-col"
              >
                <div
                  className="h-40 w-full flex relative shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${color}11, ${color}33)`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none scale-150 group-hover:rotate-12 transition-transform duration-700">
                    <div className="text-9xl font-black" style={{ color }}>
                      {template.name?.charAt(0)}
                    </div>
                  </div>
                  {["WEDDING", "BIRTHDAY"].includes(template.category) && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-1 ring-2 ring-white/50 animate-pulse">
                      <Star className="w-3 h-3 fill-white" /> OMMABOP
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold tracking-wider text-gray-600 shadow-sm border border-black/5">
                    {CATEGORY_LABELS[template.category] || template.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-semibold text-sm" style={{ color }}>
                      {template.price === 0
                        ? "Bepul"
                        : `${(template.price / 100).toLocaleString()} UZS`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("select")}
          className="p-2 bg-white hover:bg-gray-50 border rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Shablon ma'lumotlarini to'ldiring
          </h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
            O'zgarishlar o'ng tomonda jonli ko'rinadi
          </p>
        </div>
      </div>

      {selectedTemplate && (
        <InvitationEditor
          template={selectedTemplate}
          onSubmit={handleSubmit}
          loading={loading}
          buttonLabel="Yaratish va saqlash"
        />
      )}
    </div>
  );
}
