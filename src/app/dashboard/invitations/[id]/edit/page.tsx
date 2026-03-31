"use client";
// src/app/dashboard/invitations/[id]/edit/page.tsx
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Template, Invitation } from "@/types";
import InvitationEditor from "@/components/invitations/InvitationEditor";

export default function EditInvitationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [invitation, setInvitation] = useState<any>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/invitations/${id}`);
        const data = await res.json();
        if (data.invitation) {
          setInvitation(data.invitation);
          // Now fetch the template
          const tRes = await fetch("/api/templates");
          const tData = await tRes.json();
          const found = tData.templates.find(
            (t: Template) => t.id === data.invitation.templateId
          );
          setTemplate(found);
        } else {
          router.push("/dashboard/invitations");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const handleUpdate = async ({ data, title }: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, data }),
      });
      const resData = await res.json();
      if (resData.success) {
        router.push(`/dashboard/invitations/${id}`);
      } else {
        alert(resData.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!invitation || !template) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Ma'lumot topilmadi</h2>
        <Link href="/dashboard/invitations" className="text-purple-600 hover:underline mt-4 inline-block">
          Orqaga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/dashboard/invitations/${id}`}
          className="p-2 bg-white hover:bg-gray-50 border rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Taklifnomani o'zgartirish
          </h1>
          <p className="text-sm text-gray-500">
            {invitation.title} — {template.name}
          </p>
        </div>
      </div>

      <InvitationEditor
        template={template}
        initialData={invitation.data}
        initialTitle={invitation.title}
        onSubmit={handleUpdate}
        loading={saving}
        buttonLabel="O'zgarishlarni saqlash"
      />
    </div>
  );
}
