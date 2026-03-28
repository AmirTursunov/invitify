// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getDb } from "@/lib/mongodb"

const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 harf").max(50),
  email: z.string().email("Email noto'g'ri"),
  password: z.string().min(8, "Parol kamida 8 ta belgi"),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = registerSchema.parse(body)
    const db = await getDb()

    const exists = await db.collection("users").findOne({ email })
    if (exists) return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.collection("users").insertOne({
      name, email, password: hashedPassword,
      phone: phone || null, role: "USER",
      createdAt: new Date(), updatedAt: new Date(),
    })

    return NextResponse.json({ success: true, user: { id: result.insertedId.toString(), name, email } })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    console.error("Register error:", error)
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 })
  }
}
