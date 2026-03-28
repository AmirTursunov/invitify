// src/components/templates/ElegantWeddingTemplate.tsx
import React from "react";
import type { TemplateProps } from "./TemplateRenderer";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";

export default function ElegantWeddingTemplate({ template, data, isView }: TemplateProps) {
  const styles = template.styles || {};
  const primaryColor = styles.primaryColor || "#C9A84C"; // Gold
  const bgColor = styles.bgColor || "#FFF8F0";
  const textColor = styles.dark ? "#FFFFFF" : "#2C2C2C";

  return (
    <div
      className={`relative w-full overflow-hidden flex flex-col justify-center items-center ${isView ? "min-h-screen" : "h-full"}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
      
      <div className="z-10 w-full max-w-lg p-10 text-center flex flex-col items-center">
        {/* Top Decoration */}
        <div className="mb-6 opacity-60">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C50 22 30 38 0 40C30 40 50 22 50 0ZM50 0C50 22 70 38 100 40C70 40 50 22 50 0Z" fill={primaryColor} />
            <circle cx="50" cy="20" r="4" fill={primaryColor} />
          </svg>
        </div>

        <h2 className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70" style={{ color: primaryColor }}>
          Sizni shodiyonamizga lutfan taklif etamiz
        </h2>

        {data.groom && data.bride ? (
          <div className="my-8 flex flex-col items-center">
            <h1 className="text-5xl font-serif italic" style={{ color: primaryColor }}>{data.groom}</h1>
            <span className="text-3xl font-light my-2 opacity-60">&amp;</span>
            <h1 className="text-5xl font-serif italic" style={{ color: primaryColor }}>{data.bride}</h1>
          </div>
        ) : (
          <h1 className="text-4xl font-serif italic my-8" style={{ color: primaryColor }}>{data.name || "Ism sharifi"}</h1>
        )}

        {data.message && (
          <p className="text-sm italic opacity-80 mb-8 max-w-sm leading-relaxed">
            "{data.message}"
          </p>
        )}

        <div className="w-full h-px opacity-20 my-6" style={{ backgroundColor: primaryColor }} />

        <div className="grid gap-5 w-full max-w-xs text-sm">
          {data.date && (
            <div className="flex flex-col items-center">
              <Calendar className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
              <span className="font-medium tracking-wide">{data.date}</span>
            </div>
          )}
          {data.time && (
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
              <span className="font-medium tracking-wide">{data.time}</span>
            </div>
          )}
          {data.venue && (
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 mb-1" style={{ color: primaryColor }} />
              <span className="font-medium tracking-wide">{data.venue}</span>
              {data.address && <span className="opacity-70 text-xs mt-0.5">{data.address}</span>}
            </div>
          )}
        </div>

        <div className="w-full h-px opacity-20 my-6" style={{ backgroundColor: primaryColor }} />
        
        {data.phone && (
          <div className="flex items-center gap-2 mt-2">
            <Phone className="w-4 h-4" style={{ color: primaryColor }} />
            <span className="tracking-wider text-xs">{data.phone}</span>
          </div>
        )}

        {/* Bottom Decoration */}
        <div className="mt-8 opacity-60 rotate-180">
          <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C50 22 30 38 0 40C30 40 50 22 50 0ZM50 0C50 22 70 38 100 40C70 40 50 22 50 0Z" fill={primaryColor} />
            <circle cx="50" cy="20" r="4" fill={primaryColor} />
          </svg>
        </div>
      </div>
    </div>
  );
}
