// src/app/api/invitations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { randomBytes } from "crypto"

const createSchema = z.object({
  templateId: z.string(),
  title: z.string().min(1, "Sarlavha kiriting"),
  data: z.record(z.any()),
})

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })

  const db = await getDb()
  const invitations = await db.collection("invitations")
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 }).toArray()

  const templateIds = [...new Set(invitations.map(i => i.templateId))]
  const templates = await db.collection("templates")
    .find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } })
    .toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), { ...t, id: t._id.toString(), _id: undefined }]))

  const orderIds = invitations.map(i => i._id.toString())
  const orders = await db.collection("orders")
    .find({ invitationId: { $in: orderIds } }).toArray()
  const orderMap = Object.fromEntries(orders.map(o => [o.invitationId, { ...o, id: o._id.toString(), _id: undefined }]))

  const serialized = invitations.map(inv => ({
    ...inv,
    id: inv._id.toString(),
    _id: undefined,
    template: templateMap[inv.templateId] || null,
    order: orderMap[inv._id.toString()] || null,
  }))

  return NextResponse.json({ invitations: serialized })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })

  try {
    const body = await request.json()
    const { templateId, title, data } = createSchema.parse(body)
    const db = await getDb()

    const template = await db.collection("templates").findOne({
      _id: new ObjectId(templateId), isActive: true
    })
    if (!template) return NextResponse.json({ error: "Shablon topilmadi" }, { status: 404 })

    const slug = randomBytes(6).toString("hex")
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${slug}`

    const result = await db.collection("invitations").insertOne({
      userId: session.user.id,
      templateId,
      title,
      slug,
      data,
      status: "DRAFT",
      viewCount: 0,
      publicUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const invitation = { id: result.insertedId.toString(), userId: session.user.id, templateId, title, slug, data, status: "DRAFT", viewCount: 0, publicUrl, template: { ...template, id: template._id.toString(), _id: undefined } }
    return NextResponse.json({ success: true, invitation })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    console.error(error)
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 })
  }
}
