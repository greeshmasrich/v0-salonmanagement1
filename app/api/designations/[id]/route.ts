import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(req)
    if (!user || (user.role !== "SuperAdmin" && user.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { name, description } = await req.json()
    await query("UPDATE designations SET name = ?, description = ? WHERE id = ?", [
      name,
      description || null,
      params.id,
    ])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] designations PUT error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(req)
    if (!user || (user.role !== "SuperAdmin" && user.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await query("DELETE FROM designations WHERE id = ?", [params.id])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] designations DELETE error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
