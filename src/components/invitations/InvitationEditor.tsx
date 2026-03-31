"use client";
// src/components/invitations/InvitationEditor.tsx
import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight, Save } from "lucide-react";
import type { Template, TemplateFields } from "@/types";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

interface InvitationEditorProps {
  template: Template;
  initialData?: Record<string, string>;
  initialTitle?: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
  buttonLabel?: string;
}

export default function InvitationEditor({
  template,
  initialData,
  initialTitle = "",
  onSubmit,
  loading = false,
  buttonLabel = "Saqlash",
}: InvitationEditorProps) {
  const fields = (template.fields || {}) as TemplateFields;

  // Initialize data with either initialData, sample placeholders, or empty strings
  const getInitialData = () => {
    if (initialData) return initialData;

    const sampleData: Record<string, string> = {};
    Object.entries(fields as Record<string, any>).forEach(([key, f]) => {
      let sample = f.placeholder || "Kiriting...";
      if (key.toLowerCase().includes("name") || key.includes("groom") || key.includes("bride"))
        sample = key === "bride" ? "Aziza" : "Azizbek";
      if (key.toLowerCase().includes("date")) sample = new Date().toISOString().split('T')[0];
      if (key.toLowerCase().includes("time")) sample = "18:00";
      if (key.toLowerCase().includes("venue")) sample = "Restoran nomi";
      if (key.toLowerCase().includes("address"))
        sample = "Manzilni kiriting";
      if (key.toLowerCase().includes("phone")) sample = "+998 90 123 45 67";
      if (key.toLowerCase().includes("message"))
        sample = "Sizlarni shodiyonamizda kutib qolamiz!";
      sampleData[key] = sample;
    });
    return sampleData;
  };

  const [data, setData] = useState<Record<string, string>>(getInitialData());
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");

  const handleUpdate = (field: string, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError("Sarlavha majburiy!");
      return;
    }
    onSubmit({ data, title });
  };

  // Scaling logic for phone preview
  const SCREEN_W = 280;
  const RENDER_W = 390;
  const scale = SCREEN_W / RENDER_W;
  const RENDER_H = 844; // Target height for iPhone-like aspect ratio
  const SCREEN_H = RENDER_H * scale;

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* ── LEFT: Phone Preview (Now Interactive!) ── */}
      <div className="flex justify-center lg:justify-start lg:sticky lg:top-8 lg:self-start">
        <div
          className="relative bg-[#0f0f12] rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/10 flex-shrink-0 p-3"
          style={{ width: SCREEN_W + 24 }}
        >
          {/* Notch and Hardware details */}
          <div className="absolute top-0 inset-x-0 flex justify-center z-30 pointer-events-none">
            <div className="bg-[#0f0f12] rounded-b-[1.5rem] w-32 h-7" />
          </div>
          
          {/* Decorative side buttons */}
          <div className="absolute -left-[2px] top-28 w-[2px] h-10 bg-white/10 rounded-l-full" />
          <div className="absolute -left-[2px] top-44 w-[4px] h-14 bg-white/20 rounded-l-full ring-1 ring-black/20" />
          <div className="absolute -right-[2px] top-40 w-[4px] h-20 bg-white/20 rounded-r-full ring-1 ring-black/20" />

          {/* Inner Screen */}
          <div
            className="bg-white rounded-[2.8rem] overflow-hidden relative shadow-inner"
            style={{ width: SCREEN_W, height: SCREEN_H }}
          >
            {/* Status bar spacer */}
            <div className="h-8 bg-transparent relative z-20 pointer-events-none" />

            {/* Template Renderer — Pointer events ENABLED */}
            <div
              className="relative z-10"
              style={{
                width: RENDER_W,
                height: RENDER_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <TemplateRenderer
                template={template}
                data={data}
                onUpdate={handleUpdate}
              />
            </div>

            {/* In-preview editing hint */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center pointer-events-none z-30">
              <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-0 animate-fade-in-delayed hover:opacity-100 transition-opacity">
                Matnni bosing va tahrirlang
              </div>
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center mt-3 mb-1">
            <div className="w-24 h-1.5 bg-white/10 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Fields ── */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 h-fit">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Ma'lumotlarni kiriting
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" /> Jonli tahrirlash
            </div>
          </div>

          <div className="space-y-5">
            {Object.entries(fields as Record<string, any>).map(([key, f]) => (
              <div key={key} className="group">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1 group-focus-within:text-purple-600 transition-colors">
                  {f.label || key}
                  {f.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={data[key] || ""}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all text-sm font-medium resize-none bg-gray-50 group-hover:bg-white group-focus-within:bg-white"
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    value={data[key] || ""}
                    onChange={(e) => handleUpdate(key, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 outline-none transition-all text-sm font-medium bg-gray-50 group-hover:bg-white group-focus-within:bg-white"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Taklifnoma nomi (faqat sizga ko'rinadi)
                </label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError("");
                  }}
                  placeholder="Masalan: To'y taklifnomasi"
                  className={`w-full px-5 py-4 rounded-2xl border ${
                    error ? "border-red-400 ring-4 ring-red-400/5" : "border-gray-200"
                  } focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all outline-none bg-gray-50 focus:bg-white text-sm font-bold tracking-tight`}
                />
                {error && (
                  <p className="text-[10px] text-red-500 mt-2 font-black uppercase tracking-widest px-1">
                    {error}
                  </p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto sm:min-w-[220px] h-[58px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-purple-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {buttonLabel} <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tip Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Save className="w-24 h-24" />
          </div>
          <h3 className="text-lg font-black mb-2 flex items-center gap-2 relative z-10">
            Professional maslahat
          </h3>
          <p className="text-sm text-gray-400 font-medium leading-relaxed relative z-10 max-w-lg">
            Taklifnomangizni chiroyli chiqishi uchun qisqa va mazmunli jumlalardan foydalaning. 
            O'ng tomonda telefoningizda qanday ko'rinishini jonli tomosha qiling.
          </p>
        </div>
      </div>
    </div>
  );
}
