// src/components/templates/ModernEventTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, Video, Phone } from "lucide-react";

export default function ModernEventTemplate({ template, data, isView }: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#2563EB"; 
  const bgColor = styles.bgColor || "#F8FAFC";
  const textColor = styles.dark ? "#FFFFFF" : "#0F172A";

  return (
    <div
      className={`relative w-full flex flex-col items-center ${isView ? "min-h-screen p-8" : "h-full py-8 px-4"}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Abstract Background Design */}
      <div 
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 -mr-20 -mt-20 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-20 -ml-16 -mb-16 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="z-10 w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-2" style={{ backgroundColor: primaryColor }} />
        
        <div className="p-8">
          {data.companyName && (
            <div className="text-xs font-bold uppercase tracking-widest mb-6 opacity-60" style={{ color: primaryColor }}>
              {data.companyName}
            </div>
          )}
          
          <h1 className="text-3xl font-extrabold leading-tight mb-4 tracking-tight">
            {data.eventName || data.meetingTitle || "Corporate Event"}
          </h1>
          
          {data.message && (
            <p className="text-sm opacity-80 mb-6 border-l-2 pl-3" style={{ borderColor: primaryColor }}>
              {data.message}
            </p>
          )}

          <div className="space-y-4 my-8">
            <EventRow icon={<Calendar size={18} color={primaryColor} />} label="Sana" value={data.date || data.startDate} />
            {(data.time || data.duration) && (
              <EventRow icon={<Clock size={18} color={primaryColor} />} label="Soat" value={`${data.time || ''} ${data.duration ? `(${data.duration})` : ''}`} />
            )}
            {data.venue && (
              <EventRow icon={<MapPin size={18} color={primaryColor} />} label="Manzil" value={data.venue} subValue={data.address} />
            )}
            {data.meetingLink && (
              <EventRow icon={<Video size={18} color={primaryColor} />} label="Havola" value={data.platform || "Online"} subValue={data.meetingLink} isLink />
            )}
            {data.phone && (
              <EventRow icon={<Phone size={18} color={primaryColor} />} label="Aloqa" value={data.phone} />
            )}
          </div>
          
          {data.contactPerson && (
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <div className="text-xs opacity-50 uppercase font-medium">Mas'ul shaxs</div>
                <div className="font-semibold text-sm">{data.contactPerson}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventRow({ icon, label, value, subValue, isLink }: any) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-xs font-medium opacity-50 capitalize">{label}</div>
        {isLink ? (
          <a href={subValue} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-blue-600 truncate block max-w-[200px]">
            {value} Havolasi
          </a>
        ) : (
          <div className="font-semibold text-sm text-gray-800">{value}</div>
        )}
        {subValue && !isLink && <div className="text-xs opacity-60 mt-0.5">{subValue}</div>}
      </div>
    </div>
  );
}
