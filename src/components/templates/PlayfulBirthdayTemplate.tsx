// src/components/templates/PlayfulBirthdayTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, PartyPopper } from "lucide-react";

export default function PlayfulBirthdayTemplate({ template, data, isView }: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#FF6B6B";
  const bgColor = styles.bgColor || "#FFF5F5";
  const textColor = styles.dark ? "#FFFFFF" : "#333333";

  return (
    <div
      className={`relative w-full flex flex-col justify-center items-center overflow-hidden ${isView ? "min-h-screen" : "h-full"}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Decorative Circles */}
      <div className="absolute top-10 left-10 w-24 h-24 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ backgroundColor: primaryColor }} />
      <div className="absolute top-1/2 left-[-20px] w-16 h-16 rounded-full opacity-30 pointer-events-none" style={{ backgroundColor: "#FBBF24" }} />
      <div className="absolute bottom-1/3 right-4 w-12 h-12 rounded-full opacity-30 pointer-events-none" style={{ backgroundColor: "#3B82F6" }} />

      <div className="z-10 w-full max-w-sm p-8 text-center bg-white/40 backdrop-blur-md rounded-[3rem] shadow-xl border border-white/50 relative">
        <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 -mt-16 border-4" style={{ borderColor: primaryColor }}>
          <PartyPopper size={28} color={primaryColor} />
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-50 text-gray-600">
          Sizni taklif qilamiz!
        </h2>
        
        <h1 className="text-4xl font-extrabold mb-1" style={{ color: primaryColor }}>
          {data.name || data.childName || "Ism"}
        </h1>
        
        {data.age && (
          <div className="inline-block px-4 py-1 rounded-full text-white font-bold text-sm shadow-md mt-2 mb-4" style={{ backgroundColor: primaryColor }}>
            {data.age} yosh
          </div>
        )}

        {data.message && (
          <p className="text-sm font-medium mt-4 mb-6 opacity-80 px-4">
            {data.message}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mt-6">
          {data.date && (
            <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left">
              <Calendar size={16} color={primaryColor} className="mb-2" />
              <div className="text-xs opacity-50 uppercase font-bold">Sana</div>
              <div className="text-sm font-bold text-gray-800 truncate">{data.date}</div>
            </div>
          )}
          {data.time && (
            <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left">
              <Clock size={16} color={primaryColor} className="mb-2" />
              <div className="text-xs opacity-50 uppercase font-bold">Vaqt</div>
              <div className="text-sm font-bold text-gray-800 truncate">{data.time}</div>
            </div>
          )}
          {data.venue && (
            <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left col-span-2">
              <MapPin size={16} color={primaryColor} className="mb-2" />
              <div className="text-xs opacity-50 uppercase font-bold">Manzil</div>
              <div className="text-sm font-bold text-gray-800">{data.venue}</div>
              {data.address && <div className="text-xs opacity-60 truncate mt-0.5">{data.address}</div>}
            </div>
          )}
        </div>
        
        {data.phone && (
          <div className="mt-6 text-sm font-bold opacity-70">
            Aloqa uchun: <span style={{ color: primaryColor }}>{data.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
