"use client";
import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { Download, Lock, Loader2 } from "lucide-react";
import TemplateRenderer from "@/components/templates/TemplateRenderer";

export default function DownloadImageButton({ 
  template, 
  data, 
  isPaid,
  title
}: { 
  template: any; 
  data: any; 
  isPaid: boolean;
  title: string;
}) {
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      setLoading(true);
      // We give it a small delay to ensure fonts/images are fully loaded (though theoretically not strictly needed)
      await new Promise(r => setTimeout(r, 100));
      
      const dataUrl = await htmlToImage.toJpeg(printRef.current, { 
        quality: 1, 
        pixelRatio: 2, // High resolution
        backgroundColor: template?.styles?.bgColor || '#ffffff'
      });
      
      const link = document.createElement("a");
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Rasmni saqlashda xatolik yuz berdi. Iltimos qayta urining.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPaid) {
    return (
      <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200/50 rounded-full flex items-center justify-center text-gray-500">
            <Lock className="w-4 h-4" />
          </div>
          <div>
             <h3 className="font-semibold text-gray-800 text-sm">Rasm qilib saqlash</h3>
             <p className="text-xs text-gray-500 mt-0.5">To'lov qilingandan so'ng ochiladi</p>
          </div>
        </div>
        <button disabled className="bg-gray-200 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
          Yuklab olish
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-200/50 rounded-full flex items-center justify-center text-purple-600">
            <Download className="w-4 h-4" />
          </div>
          <div>
             <h3 className="font-semibold text-purple-900 text-sm">Rasm qilib saqlash</h3>
             <p className="text-xs text-purple-700/70 mt-0.5">Yuqori sifatli (HD) rasm formatida</p>
          </div>
        </div>
        <button 
          onClick={handleDownload}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {loading ? "Yuklanmoqda..." : "Saqlash"}
        </button>
      </div>

      {/* Hidden off-screen container for rendering the HD image snapshot */}
      <div className="overflow-hidden h-0 w-0 absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={printRef} 
          // Set a fixed mobile-like aspect ratio but large scale (e.g. 1080x1920) for high quality image
          className="w-[1080px] h-[1920px] bg-white flex flex-col justify-center overflow-hidden" 
        >
           <TemplateRenderer template={template} data={data} isView={true} />
        </div>
      </div>
    </>
  );
}
