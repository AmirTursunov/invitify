import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-purple-100">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">Yuklanmoqda...</p>
    </div>
  );
}
