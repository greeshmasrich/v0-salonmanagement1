import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get("category_id")
    let sql = "SELECT * FROM service_subcategories WHERE is_active = 1"
    const params: any[] = []
    if (category_id) {
      sql += " AND category_id = ?"
      params.push(category_id)
    }
    sql += " ORDER BY name ASC"
    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("[v0] service-subcategories GET error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req)
    if (!user || (user.role !== "SuperAdmin" && user.role !== "Admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const { id, category_id, name, description, is_active = true } = await req.json()
    await query(
      "INSERT INTO service_subcategories (id, category_id, name, description, is_active) VALUES (?, ?, ?, ?, ?)",
      [id, category_id, name, description || null, is_active !== false],
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] service-subcategories POST error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
