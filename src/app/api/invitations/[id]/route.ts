// src/app/api/invitations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })
  const { id } = await params
  const db = await getDb()

  const inv = await db.collection("invitations").findOne({ _id: new ObjectId(id), userId: session.user.id })
  if (!inv) return NextResponse.json({ error: "Topilmadi" }, { status: 404 })

  const [template, order] = await Promise.all([
    db.collection("templates").findOne({ _id: new ObjectId(inv.templateId) }),
    db.collection("orders").findOne({ invitationId: id }),
  ])

  return NextResponse.json({
    invitation: {
      ...inv, id: inv._id.toString(), _id: undefined,
      template: template ? { ...template, id: template._id.toString(), _id: undefined } : null,
      order: order ? { ...order, id: order._id.toString(), _id: undefined } : null,
    }
  })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })
  const { id } = await params
  const db = await getDb()

  const existing = await db.collection("invitations").findOne({ _id: new ObjectId(id), userId: session.user.id })
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 })

  const body = await request.json()
  await db.collection("invitations").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...body, updatedAt: new Date() } }
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })
  const { id } = await params
  const db = await getDb()

  const existing = await db.collection("invitations").findOne({ _id: new ObjectId(id), userId: session.user.id })
  if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 })
  if (existing.status === "ACTIVE") return NextResponse.json({ error: "Faol taklifnomani o'chirish mumkin emas" }, { status: 403 })

  await db.collection("invitations").deleteOne({ _id: new ObjectId(id) })
  return NextResponse.json({ success: true })
}
