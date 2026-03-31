// src/app/api/invitations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getDb, ObjectId } from "@/lib/mongodb";

const updateSchema = z.object({
  title: z.string().min(1, "Sarlavha kiriting").optional(),
  data: z.record(z.any()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const db = await getDb();
  const invitation = await db.collection("invitations").findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!invitation)
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json({
    invitation: { ...invitation, id: invitation._id.toString(), _id: undefined },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  try {
    const body = await request.json();
    const { title, data } = updateSchema.parse(body);
    const db = await getDb();

    const invitation = await db.collection("invitations").findOne({
      _id: new ObjectId(id),
      userId: session.user.id,
    });

    if (!invitation)
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    // Prevent editing if already active/paid? 
    // For now let's allow it, but usually business logic might restrict this.
    
    const updateData: any = { updatedAt: new Date() };
    if (title) updateData.title = title;
    if (data) {
      // Merge data or replace? Usually for invitations we replace the whole data object
      updateData.data = data;
    }

    await db.collection("invitations").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    console.error(error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const db = await getDb();
  const result = await db.collection("invitations").deleteOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (result.deletedCount === 0)
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  return NextResponse.json({ success: true });
}
