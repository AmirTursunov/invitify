// src/components/templates/DefaultTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, Info } from "lucide-react";
import EditableField from "../ui/EditableField";

export default function DefaultTemplate({
  template,
  data,
  isView,
  onUpdate,
}: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#64748B";
  const bgColor = styles.bgColor || "#F1F5F9";
  const textColor = styles.dark ? "#FFFFFF" : "#1E293B";

  return (
    <div
      className="relative w-full min-h-full flex flex-col justify-start items-center py-8 px-4"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div
        className="z-10 w-full max-w-sm bg-white rounded-2xl shadow-lg border overflow-hidden"
        style={{ borderColor: `${primaryColor}33` }}
      >
        {/* Header */}
        <div
          className="h-24 w-full flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: primaryColor }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)",
              backgroundPosition: "0 0, 10px 10px",
              backgroundSize: "20px 20px",
            }}
          />
          <EditableField
            value={
              (data.eventName as string) ||
              (data.title as string) ||
              template.name ||
              ""
            }
            onChange={(val) =>
              onUpdate?.(data.eventName ? "eventName" : "title", val)
            }
            isView={isView}
            placeholder="Tadbir nomi"
            className="text-2xl font-bold text-white relative z-10 px-4 text-center drop-shadow-md w-full"
          />
        </div>

        {/* Body */}
        <div className="p-6">
          <EditableField
            value={(data.message as string) || ""}
            onChange={(val) => onUpdate?.("message", val)}
            isView={isView}
            placeholder="Sizni ushbu tadbirga taklif qilamiz..."
            className="mb-6 text-sm text-center italic opacity-80 bg-gray-50 p-4 rounded-xl border border-gray-100 w-full"
            multiline
          />

          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => {
              if (
                ["title", "eventName", "message", "_title"].includes(key) ||
                !value
              )
                return null;

              let Icon = Info;
              let label = key;

              if (key === "date" || key === "startDate" || key === "endDate")
                Icon = Calendar;
              if (key === "time" || key === "iftarTime" || key === "duration")
                Icon = Clock;
              if (key === "venue" || key === "address" || key === "location")
                Icon = MapPin;

              label = key.replace(/([A-Z])/g, " $1").toLowerCase();

              return (
                <div
                  key={key}
                  className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0"
                >
                  <Icon
                    className="w-5 h-5 shrink-0 mt-0.5 opacity-60"
                    style={{ color: primaryColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold uppercase opacity-50 tracking-wider mb-0.5">
                      {label}
                    </div>
                    <EditableField
                      value={(value as string) || ""}
                      onChange={(val) => onUpdate?.(key, val)}
                      isView={isView}
                      placeholder="Ma'lumot"
                      className="text-sm font-medium w-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <span className="text-xs uppercase font-bold tracking-widest opacity-40">
            Tadbirga taklifnoma
          </span>
        </div>
      </div>
    </div>
  );
}
