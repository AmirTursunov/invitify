// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { sendTelegramMessage, formatPaymentConfirmMessage, formatPaymentRejectedMessage } from "@/lib/telegram"
import { sendEmail, orderConfirmedEmailHtml } from "@/lib/email"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = Number(searchParams.get("page") || 1)
  const limit = 20

  const db = await getDb()
  const filter = status ? { status } : {}
  const [orders, total] = await Promise.all([
    db.collection("orders").find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection("orders").countDocuments(filter),
  ])

  const userIds = [...new Set(orders.map(o => o.userId))]
  const users = await db.collection("users").find({ _id: { $in: userIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), { id: u._id.toString(), name: u.name, email: u.email, phone: u.phone }]))

  const invIds = orders.map(o => { try { return new ObjectId(o.invitationId) } catch { return null } }).filter(Boolean)
  const invitations = await db.collection("invitations").find({ _id: { $in: invIds } }).toArray()
  const templateIds = [...new Set(invitations.map(i => i.templateId))]
  const templates = await db.collection("templates").find({ _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } }).toArray()
  const templateMap = Object.fromEntries(templates.map(t => [t._id.toString(), { ...t, id: t._id.toString(), _id: undefined }]))
  const invMap = Object.fromEntries(invitations.map(i => [i._id.toString(), { ...i, id: i._id.toString(), _id: undefined, template: templateMap[i.templateId] }]))

  const serialized = orders.map(o => ({ ...o, id: o._id.toString(), _id: undefined, user: userMap[o.userId], invitation: invMap[o.invitationId] }))
  return NextResponse.json({ orders: serialized, total, page, limit })
}

const actionSchema = z.object({
  orderId: z.string(),
  action: z.enum(["confirm", "reject"]),
  note: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!["ADMIN","SUPER_ADMIN"].includes(session?.user?.role as string)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })

  const body = await request.json()
  const { orderId, action, note } = actionSchema.parse(body)
  const db = await getDb()

  const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })
  if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 })

  const [user, invitation] = await Promise.all([
    db.collection("users").findOne({ _id: new ObjectId(order.userId) }),
    db.collection("invitations").findOne({ _id: new ObjectId(order.invitationId) }),
  ])
  const template = invitation ? await db.collection("templates").findOne({ _id: new ObjectId(invitation.templateId) }) : null

  if (action === "confirm") {
    await db.collection("orders").updateOne({ _id: new ObjectId(orderId) }, {
      $set: { status: "CONFIRMED", confirmedAt: new Date(), paidAt: new Date(), adminNote: note || null, updatedAt: new Date() }
    })
    await db.collection("invitations").updateOne({ _id: new ObjectId(order.invitationId) }, {
      $set: { status: "ACTIVE", updatedAt: new Date() }
    })
    if (user && template) {
      sendTelegramMessage(formatPaymentConfirmMessage({ orderId, userName: user.name || "Foydalanuvchi", templateName: template.name, amount: order.amount })).catch(console.error)
      if (invitation?.publicUrl) {
        sendEmail({ to: user.email, subject: "✅ To'lovingiz tasdiqlandi — Invitify", html: orderConfirmedEmailHtml({ userName: user.name || "Foydalanuvchi", templateName: template.name, invitationUrl: invitation.publicUrl }) }).catch(console.error)
      }
    }
    return NextResponse.json({ success: true, message: "To'lov tasdiqlandi" })
  } else {
    await db.collection("orders").updateOne({ _id: new ObjectId(orderId) }, { $set: { status: "REJECTED", adminNote: note || null, updatedAt: new Date() } })
    await db.collection("invitations").updateOne({ _id: new ObjectId(order.invitationId) }, { $set: { status: "DRAFT", updatedAt: new Date() } })
    sendTelegramMessage(formatPaymentRejectedMessage({ orderId, reason: note })).catch(console.error)
    return NextResponse.json({ success: true, message: "Buyurtma rad etildi" })
  }
}
