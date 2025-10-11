import { NextResponse, type NextRequest } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const staff_id = searchParams.get("staff_id") || user.id
    const rows = await query(
      `SELECT ss.service_id, s.name, s.duration, s.price
       FROM staff_services ss
       JOIN services s ON ss.service_id = s.id
       WHERE ss.staff_id = ?`,
      [staff_id],
    )
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("[v0] staff-services GET error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { staff_id, service_ids } = await request.json()
    const target = staff_id || user.id
    // Only self-manage unless admin
    if (user.role === "Staff" && target !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!Array.isArray(service_ids) || service_ids.length === 0) {
      return NextResponse.json({ error: "service_ids required" }, { status: 400 })
    }
    // Insert ignore duplicates
    for (const sid of service_ids) {
      await query("INSERT IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)", [target, sid])
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] staff-services POST error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const staff_id = searchParams.get("staff_id") || user.id
    const service_id = searchParams.get("service_id")
    if (!service_id) return NextResponse.json({ error: "service_id required" }, { status: 400 })
    if (user.role === "Staff" && staff_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await query("DELETE FROM staff_services WHERE staff_id = ? AND service_id = ?", [staff_id, service_id])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] staff-services DELETE error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
