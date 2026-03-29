"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, ArrowRight, Eye, Smartphone, Star } from "lucide-react";
import Link from "next/link";
import type { Template, TemplateFields, TemplateStyles } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export default function CreateInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("template");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"select" | "fill">(templateIdParam ? "fill" : "select");
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

  const handleSubmit = async (formData: Record<string, string>) => {
    if (!selectedTemplate) return;
    setLoading(true);

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title: formData._title || `${selectedTemplate.name} — ${new Date().toLocaleDateString("uz-UZ")}`,
          data: Object.fromEntries(Object.entries(formData).filter(([k]) => !k.startsWith("_"))),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/dashboard/invitations/${data.invitation.id}`);
      } else {
        alert(data.error || "Xatolik yuz berdi");
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
            <p className="text-sm text-gray-500">Quyidagi shablonlardan birini tanlang</p>
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
                  style={{ background: `linear-gradient(135deg, ${color}11, ${color}33)` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none scale-150 group-hover:rotate-12 transition-transform duration-700">
                    <div className="text-9xl font-black" style={{ color }}>{template.name?.charAt(0)}</div>
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
                  <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{template.description}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-semibold text-sm" style={{ color }}>
                      {template.price === 0 ? "Bepul" : `${(template.price / 100).toLocaleString()} UZS`}
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
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-140px)] flex flex-col pt-4">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <button onClick={() => setStep("select")} className="p-2 bg-white hover:bg-gray-50 border rounded-xl transition-colors">
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

      <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
        {selectedTemplate && (
          <InvitationEditor template={selectedTemplate} onSubmit={handleSubmit} loading={loading} />
        )}
      </div>
    </div>
  );
}

function InvitationEditor({ template, onSubmit, loading }: any) {
  const fields = (template.fields || {}) as TemplateFields;
  const schemaObj: any = { _title: z.string().min(1, "Sarlavha majburiy") };

  // Set up default/sample values
  const defaultValues: Record<string, string> = { _title: "" };
  const sampleData: Record<string, string> = {};

  Object.entries(fields as Record<string, any>).forEach(([key, f]) => {
    schemaObj[key] = f.required ? z.string().min(1, "Majburiy maydon") : z.string().optional();
    
    defaultValues[key] = ""; // Form inputs start empty
    
    // Fallback sample data to give an impressive preview
    let sample = f.placeholder || "Kiriting...";
    if (key.includes("Name") || key.includes("groom") || key.includes("bride")) sample = "Azizbek";
    if (key === "bride") sample = "Aziza";
    if (key.includes("date")) sample = "2024-12-31";
    if (key.includes("time")) sample = "18:00";
    if (key.includes("venue")) sample = "Versal Restorani";
    if (key.includes("address")) sample = "Toshkent shahri, Amir Temur ko'chasi 16";
    if (key.includes("phone")) sample = "+998 90 123 45 67";
    if (key.includes("message")) sample = "Sizlarni shodiyonamizda kutib qolamiz!";
    if (key.includes("company")) sample = "Innovatsiya MChJ";
    
    sampleData[key] = sample;
  });
  
  const schema = z.object(schemaObj);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });
  
  const watchedData = useWatch({ control });
  
  const previewData = { ...sampleData };
  if (watchedData) {
    Object.keys(watchedData).forEach((key) => {
      if (watchedData[key] !== undefined && watchedData[key] !== "") {
        previewData[key] = watchedData[key];
      }
    });
  }

  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");

  return (
    <>
      {/* Mobile Tabs */}
      <div className="w-full lg:hidden flex items-center justify-center shrink-0 mb-4 px-4">
        <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full max-w-sm shadow-inner">
          <button 
            type="button"
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "form" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Ma'lumotlar
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${activeTab === "preview" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Ko'rish <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
          </button>
        </div>
      </div>

      {/* Form Panel */}
      <div className={`w-full lg:w-[400px] xl:w-[450px] bg-white border border-gray-100 rounded-3xl p-6 overflow-y-auto shadow-sm flex-1 min-h-0 lg:flex-none lg:shrink-0 ${activeTab === "form" ? "block" : "hidden lg:block"}`}>
        <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Taklifnoma nomi (shaxsiy)</label>
            <input 
              {...register("_title")} 
              placeholder="Masalan: Mening to'yim" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none bg-gray-50 focus:bg-white"
            />
            {errors._title && <p className="text-red-500 text-xs mt-1">{(errors._title as any).message}</p>}
          </div>

          <div className="w-full h-px bg-gray-100 my-4" />

          {Object.entries(fields as Record<string, any>).map(([key, field]) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize flex items-center justify-between">
                <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                {!field.required && <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider">Ixtiyoriy</span>}
              </label>
              
              {field.type === "textarea" ? (
                <textarea
                  {...register(key)}
                  placeholder={field.placeholder || sampleData[key]}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none bg-gray-50 focus:bg-white resize-none"
                />
              ) : field.type === "select" ? (
                <select
                  {...register(key)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none bg-gray-50 focus:bg-white"
                >
                  <option value="">Tanlang...</option>
                  {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type={field.type === "date" ? "date" : field.type === "time" ? "time" : "text"}
                  {...register(key)}
                  placeholder={field.placeholder || sampleData[key]}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none bg-gray-50 focus:bg-white"
                />
              )}

              {errors[key] && <p className="text-red-500 text-xs mt-1">{(errors as any)[key].message}</p>}
            </div>
          ))}
          
          <div className="pt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4 border-t border-gray-50">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Yaratish va davom etish <ArrowRight className="w-4 h-4" /></>}
            </button>
            <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Eye className="w-3 h-3" /> Ko'rinish avtomatik yangilanadi
            </p>
          </div>
        </form>
      </div>

      {/* Preview Panel */}
      <div className={`flex-1 bg-gray-50/50 rounded-3xl items-center justify-center p-4 lg:p-8 relative overflow-hidden border border-gray-200/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] ${activeTab === "preview" ? "flex" : "hidden lg:flex"}`}>
        {/* Phone Frame wrapper */}
        <div className="relative w-full max-w-[400px] aspect-[9/19.5] bg-black rounded-[3rem] p-3 shadow-2xl flex shrink-0 ring-1 ring-gray-900/5">
          {/* Top Notch/Dynamic Island */}
          <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50">
            <div className="w-[120px] h-[30px] bg-black rounded-b-3xl"></div>
          </div>
          
          {/* Inner Screen */}
          <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
            <div className="w-full h-full overflow-y-auto no-scrollbar scroll-smooth">
               <TemplateRenderer template={template} data={previewData as any} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
