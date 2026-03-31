// src/components/templates/ElegantWeddingTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import EditableField from "../ui/EditableField";

export default function ElegantWeddingTemplate({
  template,
  data,
  isView,
  onUpdate,
}: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#C9A84C";
  const bgColor = styles.bgColor || "#FFF8F0";
  const textColor = styles.dark ? "#FFFFFF" : "#2C2C2C";

  return (
    <div
      className="relative w-full min-h-full flex flex-col justify-start items-center py-10 px-6"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Dotted background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Top Decoration */}
        <div className="mb-6 opacity-60">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
            <path
              d="M50 0C50 22 30 38 0 40C30 40 50 22 50 0ZM50 0C50 22 70 38 100 40C70 40 50 22 50 0Z"
              fill={primaryColor}
            />
            <circle cx="50" cy="20" r="4" fill={primaryColor} />
          </svg>
        </div>

        <h2
          className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70"
          style={{ color: primaryColor }}
        >
          Sizni shodiyonamizga lutfan taklif etamiz
        </h2>

        {/* Names */}
        {data.groom !== undefined || data.bride !== undefined ? (
          <div className="my-8 flex flex-col items-center">
            <EditableField
              value={(data.groom as string) || ""}
              onChange={(val) => onUpdate?.("groom", val)}
              isView={isView}
              placeholder="Kuyov ismi"
              className="text-5xl font-serif italic"
              style={{ color: primaryColor }}
            />
            <span className="text-3xl font-light my-2 opacity-60">&amp;</span>
            <EditableField
              value={(data.bride as string) || ""}
              onChange={(val) => onUpdate?.("bride", val)}
              isView={isView}
              placeholder="Kelin ismi"
              className="text-5xl font-serif italic"
              style={{ color: primaryColor }}
            />
          </div>
        ) : (
          <EditableField
            value={(data.name as string) || ""}
            onChange={(val) => onUpdate?.("name", val)}
            isView={isView}
            placeholder="Ism sharifi"
            className="text-4xl font-serif italic my-8"
            style={{ color: primaryColor }}
          />
        )}

        {/* Message */}
        <EditableField
          value={(data.message as string) || ""}
          onChange={(val) => onUpdate?.("message", val)}
          isView={isView}
          multiline
          placeholder="O'z dil so'zlaringizni yozing..."
          className="text-sm italic opacity-80 mb-8 max-w-xs leading-relaxed"
        />

        <div
          className="w-full h-px opacity-20 my-4"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Details */}
        <div className="grid gap-5 w-full max-w-xs text-sm">
          <div className="flex flex-col items-center">
            <Calendar
              className="w-5 h-5 mb-1"
              style={{ color: primaryColor }}
            />
            <EditableField
              value={(data.date as string) || ""}
              onChange={(val) => onUpdate?.("date", val)}
              isView={isView}
              placeholder="2024-12-31"
              className="font-medium tracking-wide"
            />
          </div>
          <div className="flex flex-col items-center">
            <Clock className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
            <EditableField
              value={(data.time as string) || ""}
              onChange={(val) => onUpdate?.("time", val)}
              isView={isView}
              placeholder="18:00"
              className="font-medium tracking-wide"
            />
          </div>
          <div className="flex flex-col items-center">
            <MapPin className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
            <EditableField
              value={(data.venue as string) || ""}
              onChange={(val) => onUpdate?.("venue", val)}
              isView={isView}
              placeholder="To'yxona nomi"
              className="font-medium tracking-wide"
            />
            <EditableField
              value={(data.address as string) || ""}
              onChange={(val) => onUpdate?.("address", val)}
              isView={isView}
              placeholder="Manzil: shahar, ko'cha"
              className="opacity-70 text-xs mt-0.5"
            />
          </div>
        </div>

        <div
          className="w-full h-px opacity-20 my-6"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Phone */}
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" style={{ color: primaryColor }} />
          <EditableField
            value={(data.phone as string) || ""}
            onChange={(val) => onUpdate?.("phone", val)}
            isView={isView}
            placeholder="+998 90 123 45 67"
            className="tracking-wider text-xs"
          />
        </div>

        {/* Bottom Decoration */}
        <div className="mt-8 opacity-60 rotate-180">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none">
            <path
              d="M50 0C50 22 30 38 0 40C30 40 50 22 50 0ZM50 0C50 22 70 38 100 40C70 40 50 22 50 0Z"
              fill={primaryColor}
            />
            <circle cx="50" cy="20" r="4" fill={primaryColor} />
          </svg>
        </div>
      </div>
    </div>
  );
}
