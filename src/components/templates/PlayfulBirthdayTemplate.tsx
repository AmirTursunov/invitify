// src/components/templates/PlayfulBirthdayTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, PartyPopper } from "lucide-react";
import EditableField from "../ui/EditableField";

export default function PlayfulBirthdayTemplate({
  template,
  data,
  isView,
  onUpdate,
}: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#FF6B6B";
  const bgColor = styles.bgColor || "#FFF5F5";
  const textColor = styles.dark ? "#FFFFFF" : "#333333";

  return (
    <div
      className="relative w-full min-h-full flex flex-col justify-start items-center overflow-hidden py-12 px-6"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Decorative Circles */}
      <div
        className="absolute top-6 left-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute top-6 right-6 w-16 h-16 rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: "#FBBF24" }}
      />
      <div
        className="absolute bottom-6 right-6 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-6 left-6 w-12 h-12 rounded-full opacity-30 pointer-events-none"
        style={{ backgroundColor: "#3B82F6" }}
      />
      {/* Extra mid decorations */}
      <div
        className="absolute top-1/2 left-[-12px] w-16 h-16 rounded-full opacity-25 pointer-events-none"
        style={{ backgroundColor: "#A78BFA" }}
      />
      <div
        className="absolute top-1/3 right-[-10px] w-14 h-14 rounded-full opacity-25 pointer-events-none"
        style={{ backgroundColor: "#34D399" }}
      />

      {/* Card */}
      <div className="z-10 w-full max-w-sm pt-10 pb-8 px-6 text-center bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/60 relative">
        {/* Icon badge */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md border-4"
          style={{ borderColor: primaryColor }}
        >
          <PartyPopper size={28} color={primaryColor} />
        </div>

        <h2 className="text-sm font-bold uppercase tracking-widest mb-2 opacity-50 text-gray-600">
          Sizni taklif qilamiz!
        </h2>

        <EditableField
          value={(data.name as string) || (data.childName as string) || ""}
          onChange={(val) => onUpdate?.("name", val)}
          isView={isView}
          placeholder="Ismi"
          className="text-4xl font-extrabold mb-1"
          style={{ color: primaryColor }}
        />

        <div
          className="inline-flex items-center gap-1 px-4 py-1 rounded-full text-white font-bold text-sm shadow-md mt-2 mb-4"
          style={{ backgroundColor: primaryColor }}
        >
          <EditableField
            value={(data.age as string) || ""}
            onChange={(val) => onUpdate?.("age", val)}
            isView={isView}
            placeholder="0"
            className="inline-block min-w-[24px] text-center text-white"
          />
          <span>yosh</span>
        </div>

        <EditableField
          value={(data.message as string) || ""}
          onChange={(val) => onUpdate?.("message", val)}
          isView={isView}
          placeholder="Tug'ilgan kun uchun dil izhoringiz..."
          className="text-sm font-medium mt-2 mb-6 opacity-80 px-2 leading-relaxed"
          multiline
        />

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left">
            <Calendar size={16} color={primaryColor} className="mb-1.5" />
            <div className="text-xs opacity-50 uppercase font-bold mb-0.5">
              Sana
            </div>
            <EditableField
              value={(data.date as string) || ""}
              onChange={(val) => onUpdate?.("date", val)}
              isView={isView}
              placeholder="31 Dekabr"
              className="text-sm font-bold text-gray-800 truncate"
            />
          </div>

          <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left">
            <Clock size={16} color={primaryColor} className="mb-1.5" />
            <div className="text-xs opacity-50 uppercase font-bold mb-0.5">
              Vaqt
            </div>
            <EditableField
              value={(data.time as string) || ""}
              onChange={(val) => onUpdate?.("time", val)}
              isView={isView}
              placeholder="18:00"
              className="text-sm font-bold text-gray-800 truncate"
            />
          </div>

          <div className="bg-white/80 p-3 rounded-2xl shadow-sm text-left col-span-2">
            <MapPin size={16} color={primaryColor} className="mb-1.5" />
            <div className="text-xs opacity-50 uppercase font-bold mb-0.5">
              Manzil
            </div>
            <EditableField
              value={(data.venue as string) || ""}
              onChange={(val) => onUpdate?.("venue", val)}
              isView={isView}
              placeholder="Restoran yoki o'yingoh nomi"
              className="text-sm font-bold text-gray-800"
            />
            <EditableField
              value={(data.address as string) || ""}
              onChange={(val) => onUpdate?.("address", val)}
              isView={isView}
              placeholder="Manzil"
              className="text-xs opacity-60 mt-0.5"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="mt-5 text-sm font-bold opacity-70 flex items-center justify-center gap-1 flex-wrap">
          <span>Aloqa uchun:</span>
          <EditableField
            value={(data.phone as string) || ""}
            onChange={(val) => onUpdate?.("phone", val)}
            isView={isView}
            placeholder="+998 90 123 45 67"
            style={{ color: primaryColor }}
          />
        </div>
      </div>
    </div>
  );
}
