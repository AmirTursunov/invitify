// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { sendTelegramMessage, formatNewOrderMessage } from "@/lib/telegram"

const createOrderSchema = z.object({
  invitationId: z.string(),
  telegramNote: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })

  try {
    const body = await request.json()
    const { invitationId, telegramNote } = createOrderSchema.parse(body)
    const db = await getDb()

    const invitation = await db.collection("invitations").findOne({
      _id: new ObjectId(invitationId), userId: session.user.id
    })
    if (!invitation) return NextResponse.json({ error: "Taklifnoma topilmadi" }, { status: 404 })

    const existingOrder = await db.collection("orders").findOne({ invitationId })
    if (existingOrder) return NextResponse.json({ error: "Bu taklifnoma uchun buyurtma allaqachon mavjud" }, { status: 400 })

    const template = await db.collection("templates").findOne({ _id: new ObjectId(invitation.templateId) })
    const user = await db.collection("users").findOne({ _id: new ObjectId(session.user.id) })

    const result = await db.collection("orders").insertOne({
      userId: session.user.id,
      invitationId,
      amount: template?.price || 0,
      status: "PENDING",
      telegramNote: telegramNote || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await db.collection("invitations").updateOne(
      { _id: new ObjectId(invitationId) },
      { $set: { status: "PENDING_PAYMENT", updatedAt: new Date() } }
    )

    if (user && template) {
      sendTelegramMessage(formatNewOrderMessage({
        orderId: result.insertedId.toString(),
        userName: user.name || "Noma'lum",
        userEmail: user.email,
        userPhone: user.phone || undefined,
        templateName: template.name,
        amount: template.price || 0,
        invitationTitle: invitation.title,
      })).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      order: { id: result.insertedId.toString() },
      paymentInfo: {
        cardNumber: process.env.PAYMENT_CARD_NUMBER,
        cardHolder: process.env.PAYMENT_CARD_HOLDER,
        bank: process.env.PAYMENT_BANK,
        amount: template?.price || 0,
        telegramUsername: process.env.TELEGRAM_MANAGER_USERNAME,
        note: `Buyurtma ID: ${result.insertedId.toString()}`,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    console.error(error)
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 })

  const db = await getDb()
  const orders = await db.collection("orders").find({ userId: session.user.id }).sort({ createdAt: -1 }).toArray()

  const invIds = orders.map(o => { try { return new ObjectId(o.invitationId) } catch { return null } }).filter(Boolean)
  const invitations = await db.collection("invitations").find({ _id: { $in: invIds } }).toArray()
  const templateIds = [...new Set(invitations.map(i => i.templateId))]
  const templates = await db.collection("templates").find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()

  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), { ...t, id: t._id.toString(), _id: undefined }]))
  const invMap = Object.fromEntries(invitations.map(i => [i._id.toString(), { ...i, id: i._id.toString(), _id: undefined, template: templateMap[i.templateId] }]))

  const serialized = orders.map(o => ({ ...o, id: o._id.toString(), _id: undefined, invitation: invMap[o.invitationId] || null }))
  return NextResponse.json({ orders: serialized })
}
