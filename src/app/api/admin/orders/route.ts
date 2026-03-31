// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getDb, ObjectId } from "@/lib/mongodb"
import { sendTelegramMessage, formatPaymentConfirmMessage, formatPaymentRejectedMessage } from "@/lib/telegram"
import { sendEmail, orderConfirmedEmailHtml } from "@/lib/email"
import { type DbOrder, type DbUser, type DbInvitation, type DbTemplate } from "@/types"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const page = Number(searchParams.get("page") || 1)
  const limit = 20

  const db = await getDb()
  const filter = status ? { status } : {}
  const [ordersRaw, total] = await Promise.all([
    db.collection("orders").find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
    db.collection("orders").countDocuments(filter),
  ])
  const orders = ordersRaw as unknown as DbOrder[]

  const userIds = [...new Set(orders.map(o => o.userId).filter(Boolean))]
  const usersRaw = await db.collection("users").find({
    $or: [
      { _id: { $in: userIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
      { _id: { $in: userIds.filter(id => typeof id === "string" && id.length !== 24) } as any }
    ]
  }).toArray()
  const users = usersRaw as unknown as DbUser[]
  const userMap = Object.fromEntries(users.map(u => [u._id?.toString() || "", { id: u._id?.toString(), name: u.name, email: u.email, phone: u.phone }]))

  const invIds = orders.map(o => o.invitationId).filter(Boolean)
  const invitationsRaw = await db.collection("invitations").find({
    $or: [
      { _id: { $in: invIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
      { _id: { $in: invIds.filter(id => typeof id === "string" && id.length !== 24) } as any }
    ]
  }).toArray()
  const invitations = invitationsRaw as unknown as DbInvitation[]

  const templateIds = [...new Set(invitations.map(i => i.templateId).filter(Boolean))]
  const templatesRaw = await db.collection("templates").find({
    $or: [
      { _id: { $in: templateIds.map(id => { try { return new ObjectId(id) } catch { return null } }).filter(Boolean) } },
      { _id: { $in: templateIds.filter(id => typeof id === "string" && id.length !== 24) } as any }
    ]
  }).toArray()
  const templates = templatesRaw as unknown as DbTemplate[]
  const templateMap = Object.fromEntries(templates.map(t => [t._id?.toString() || "", { ...t, id: t._id?.toString(), _id: undefined }]))
  const invMap = Object.fromEntries(invitations.map(i => [i._id?.toString() || "", { ...i, id: i._id?.toString(), _id: undefined, template: templateMap[i.templateId] }]))

  const serialized = orders.map(o => ({ 
    ...o, 
    id: o._id?.toString(), 
    _id: undefined, 
    user: userMap[o.userId], 
    invitation: invMap[o.invitationId] 
  }))
  
  return NextResponse.json({ orders: serialized, total, page, limit })
}

const actionSchema = z.object({
  orderId: z.string(),
  action: z.enum(["confirm", "reject"]),
  note: z.string().optional(),
})

export async function PATCH(request: NextRequest) {
  const session = await auth()
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role as string)) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })

  try {
    const body = await request.json()
    const { orderId, action, note } = actionSchema.parse(body)
    const db = await getDb()

    // Robust finding the order
    let orderRaw = await db.collection("orders").findOne({ _id: orderId } as any)
    if (!orderRaw) {
      try { orderRaw = await db.collection("orders").findOne({ _id: new ObjectId(orderId) }) } catch {}
    }
    
    if (!orderRaw) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 })
    const order = orderRaw as unknown as DbOrder

    const userId = order.userId?.toString() || ""
    const invId = order.invitationId?.toString() || ""

    // Robust finding user
    let userRaw = await db.collection("users").findOne({ _id: userId } as any)
    if (!userRaw) {
      try { userRaw = await db.collection("users").findOne({ _id: new ObjectId(userId) }) } catch {}
    }
    const user = userRaw as unknown as DbUser | null
    
    // Robust finding invitation
    let invitationRaw = await db.collection("invitations").findOne({ _id: invId } as any)
    if (!invitationRaw) {
      try { invitationRaw = await db.collection("invitations").findOne({ _id: new ObjectId(invId) }) } catch {}
    }
    const invitation = invitationRaw as unknown as DbInvitation | null
    
    // Robust finding template
    let template: DbTemplate | null = null
    if (invitation?.templateId) {
      const tId = invitation.templateId.toString()
      let templateRaw = await db.collection("templates").findOne({ _id: tId } as any)
      if (!templateRaw) {
        try { templateRaw = await db.collection("templates").findOne({ _id: new ObjectId(tId) }) } catch {}
      }
      template = templateRaw as unknown as DbTemplate | null
    }

    const orderObjId = orderRaw._id
    const invObjId = invitationRaw?._id

    if (action === "confirm") {
      await db.collection("orders").updateOne({ _id: orderObjId }, {
        $set: { status: "CONFIRMED", confirmedAt: new Date(), paidAt: new Date(), adminNote: note || null, updatedAt: new Date() }
      })
      if (invObjId) {
        await db.collection("invitations").updateOne({ _id: invObjId }, {
          $set: { status: "ACTIVE", updatedAt: new Date() }
        })
      }
      
      if (user && template) {
        sendTelegramMessage(formatPaymentConfirmMessage({ orderId, userName: user.name || "Foydalanuvchi", templateName: template.name, amount: order.amount })).catch(console.error)
        if (invitation?.publicUrl) {
          sendEmail({ to: user.email, subject: "✅ To'lovingiz tasdiqlandi — Invitify", html: orderConfirmedEmailHtml({ userName: user.name || "Foydalanuvchi", templateName: template.name, invitationUrl: invitation.publicUrl }) }).catch(console.error)
        }
      }
      return NextResponse.json({ success: true, message: "To'lov tasdiqlandi" })
    } else {
      await db.collection("orders").updateOne({ _id: orderObjId }, { $set: { status: "REJECTED", adminNote: note || null, updatedAt: new Date() } })
      if (invObjId) {
        await db.collection("invitations").updateOne({ _id: invObjId }, { $set: { status: "DRAFT", updatedAt: new Date() } })
      }
      sendTelegramMessage(formatPaymentRejectedMessage({ orderId, reason: note })).catch(console.error)
      return NextResponse.json({ success: true, message: "Buyurtma rad etildi" })
    }
  } catch (error) {
    console.error("Admin order action error:", error)
    return NextResponse.json({ success: false, error: "Xatolik yuz berdi" }, { status: 500 })
  }
}
