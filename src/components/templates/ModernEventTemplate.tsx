// src/components/templates/ModernEventTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, Video, Phone } from "lucide-react";
import EditableField from "../ui/EditableField";

export default function ModernEventTemplate({
  template,
  data,
  isView,
  onUpdate,
}: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#2563EB";
  const bgColor = styles.bgColor || "#F8FAFC";
  const textColor = styles.dark ? "#FFFFFF" : "#0F172A";

  return (
    <div
      className="relative w-full min-h-full flex flex-col items-center py-10 px-4"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Abstract blobs */}
      <div
        className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl opacity-20 -mr-16 -mt-16 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div
        className="absolute bottom-0 left-0 w-44 h-44 rounded-full blur-3xl opacity-20 -ml-12 -mb-12 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="z-10 w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Top accent bar */}
        <div className="h-2" style={{ backgroundColor: primaryColor }} />

        <div className="p-6">
          <EditableField
            value={(data.companyName as string) || ""}
            onChange={(val) => onUpdate?.("companyName", val)}
            isView={isView}
            placeholder="Kompaniya nomi"
            className="text-xs font-bold uppercase tracking-widest mb-4 opacity-60 block"
            style={{ color: primaryColor }}
          />

          <EditableField
            value={
              (data.eventName as string) || (data.meetingTitle as string) || ""
            }
            onChange={(val) => onUpdate?.("eventName", val)}
            isView={isView}
            placeholder="Tadbir nomi"
            className="text-2xl font-extrabold leading-tight mb-3 tracking-tight w-full block"
          />

          <EditableField
            value={(data.message as string) || ""}
            onChange={(val) => onUpdate?.("message", val)}
            isView={isView}
            placeholder="Tadbir haqida qisqacha ma'lumot"
            className="text-sm opacity-80 mb-6 border-l-2 pl-3 block w-full leading-relaxed"
            style={{ borderColor: primaryColor }}
            multiline
          />

          <div className="space-y-4 my-6">
            <EventRow
              icon={<Calendar size={18} color={primaryColor} />}
              label="Sana"
              value={(data.date as string) || (data.startDate as string)}
              onUpdate={onUpdate}
              fieldKey="date"
              isView={isView}
            />
            <EventRow
              icon={<Clock size={18} color={primaryColor} />}
              label="Soat"
              value={(data.time as string) || ""}
              subValue={data.duration as string}
              onUpdate={onUpdate}
              fieldKey="time"
              subFieldKey="duration"
              isView={isView}
            />
            <EventRow
              icon={<MapPin size={18} color={primaryColor} />}
              label="Manzil"
              value={data.venue as string}
              subValue={data.address as string}
              onUpdate={onUpdate}
              fieldKey="venue"
              subFieldKey="address"
              isView={isView}
            />
            <EventRow
              icon={<Video size={18} color={primaryColor} />}
              label="Havola"
              value={(data.platform as string) || "Online"}
              subValue={data.meetingLink as string}
              isLink
              onUpdate={onUpdate}
              fieldKey="platform"
              subFieldKey="meetingLink"
              isView={isView}
            />
            <EventRow
              icon={<Phone size={18} color={primaryColor} />}
              label="Aloqa"
              value={data.phone as string}
              onUpdate={onUpdate}
              fieldKey="phone"
              isView={isView}
            />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="text-xs opacity-50 uppercase font-medium mb-1">
              Mas'ul shaxs
            </div>
            <EditableField
              value={(data.contactPerson as string) || ""}
              onChange={(val) => onUpdate?.("contactPerson", val)}
              isView={isView}
              placeholder="Mas'ul shaxs ismi"
              className="font-semibold text-sm w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function EventRow({
  icon,
  label,
  value,
  subValue,
  isLink,
  onUpdate,
  fieldKey,
  subFieldKey,
  isView,
}: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium opacity-50 capitalize mb-0.5">
          {label}
        </div>
        {isLink ? (
          <>
            <EditableField
              value={value || ""}
              onChange={(val) => onUpdate?.(fieldKey, val)}
              isView={isView}
              placeholder="Platforma nomi"
              className="font-semibold text-sm text-blue-600 block"
            />
            <EditableField
              value={subValue || ""}
              onChange={(val) => onUpdate?.(subFieldKey, val)}
              isView={isView}
              placeholder="https://..."
              className="text-xs opacity-60 mt-0.5 text-blue-500 truncate block"
            />
          </>
        ) : (
          <>
            <EditableField
              value={value || ""}
              onChange={(val) => onUpdate?.(fieldKey, val)}
              isView={isView}
              placeholder={label}
              className="font-semibold text-sm text-gray-800 w-full"
            />
            {subFieldKey && (
              <EditableField
                value={subValue || ""}
                onChange={(val) => onUpdate?.(subFieldKey, val)}
                isView={isView}
                placeholder="Qo'shimcha ma'lumot"
                className="text-xs opacity-60 mt-0.5 block w-full"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
