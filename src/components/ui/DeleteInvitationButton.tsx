"use client";
// src/components/ui/DeleteInvitationButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export default function DeleteInvitationButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Haqiqatdan ham ushbu taklifnomani o'chirmoqchimisiz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard/invitations");
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
      O'chirish
    </button>
  );
}
