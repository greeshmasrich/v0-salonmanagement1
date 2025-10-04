import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/chairs - List all chairs
export async function GET(request: NextRequest) {
  try {

    // const user = await verifyAuth(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") === "true"

    let sql = "SELECT * FROM chairs"
    const params: any[] = []

    if (activeOnly) {
      sql += " WHERE is_active = ?"
      params.push(true)
    }

    sql += " ORDER BY chair_number ASC"

    const chairs = await query(sql, params)

    return NextResponse.json(chairs)
  } catch (error: any) {
    console.error("[v0] Error fetching chairs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/chairs - Create new chair
export async function POST(request: NextRequest) {
  try {
    // const user = await verifyAuth(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // if (user.role !== "SuperAdmin" && user.role !== "Admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const body = await request.json()
    const { chair_number, description, is_active } = body

    const result = await query(
      `INSERT INTO chairs (chair_number, description, is_active)
       VALUES (?, ?, ?)`,
      [chair_number, description || null, is_active !== false],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "Chair created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating chair:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
