import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/services - List all services
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("active") === "true"

    let sql = "SELECT * FROM services"
    const params: any[] = []

    if (activeOnly) {
      sql += " WHERE is_active = ?"
      params.push(true)
    }

    sql += " ORDER BY name ASC"

    const services = await query(sql, params)

    return NextResponse.json(services)
  } catch (error: any) {
    console.error("[v0] Error fetching services:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    // const user = await verifyAuth(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // // Check if user is admin
    // if (user.role !== "SuperAdmin" && user.role !== "Admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const body = await request.json()
    const { name, description, duration, price, is_active } = body

    // Remove 'id' from insert, let DB auto-generate it
    const result = await query(
      `INSERT INTO services (name, description, duration, price, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [name, description || null, duration, price, is_active !== false],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "Service created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
