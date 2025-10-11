import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

export async function GET() {
  try {
    const rows = await query("SELECT * FROM designations ORDER BY name ASC")
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("[v0] designations GET error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    if (!user || (user.role !== "SuperAdmin" && user.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id, name, description } = await req.json()
    await query("INSERT INTO designations (id, name, description) VALUES (?, ?, ?)", [id, name, description || null])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] designations POST error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
