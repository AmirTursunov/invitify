// src/app/api/templates/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const db = await getDb()
  const filter: Record<string, unknown> = { isActive: true }
  if (category) filter.category = category
  if (search) filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { description: { $regex: search, $options: "i" } },
  ]

  const templates = await db.collection("templates")
    .find(filter).sort({ sortOrder: 1 }).toArray()

  const serialized = templates.map(t => ({ ...t, id: t._id.toString(), _id: undefined }))
  return NextResponse.json({ templates: serialized })
}
