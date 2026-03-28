// src/app/api/admin/templates/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const db = await getDb()
  await db.collection("templates").updateOne({ _id: new ObjectId(id) }, { $set: { ...body, updatedAt: new Date() } })
  return NextResponse.json({ success: true })
}
