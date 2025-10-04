import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/availability - List all availability records
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const staffId = searchParams.get("staff_id")

    let sql = `
      SELECT 
        sa.*,
        JSON_OBJECT('id', u.id, 'full_name', u.full_name, 'role', u.role) as staff
      FROM staff_availability sa
      LEFT JOIN users u ON sa.staff_id = u.id
    `
    const params: any[] = []

    if (staffId) {
      sql += " WHERE sa.staff_id = ?"
      params.push(staffId)
    } else if (user.role === "Staff") {
      sql += " WHERE sa.staff_id = ?"
      params.push(user.id)
    }

    sql += " ORDER BY sa.date ASC, sa.start_time ASC"

    const availability = await query(sql, params)

    return NextResponse.json(availability)
  } catch (error: any) {
    console.error("[v0] Error fetching availability:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/availability - Create new availability
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { staff_id, date, start_time, end_time, is_available } = body

    // Staff can only create their own availability
    if (user.role === "Staff" && staff_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const result = await query(
      `INSERT INTO staff_availability (staff_id, date, start_time, end_time, is_available)
       VALUES (?, ?, ?, ?, ?)`,
      [staff_id, date, start_time, end_time, is_available !== false],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "Availability created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating availability:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
