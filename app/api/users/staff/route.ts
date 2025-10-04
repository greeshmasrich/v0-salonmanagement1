import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/users/staff - Get all staff members
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const staff = await query(
      `SELECT id, email, full_name, phone, role, is_active, created_at 
       FROM users 
       WHERE role IN ('Staff', 'Admin', 'SuperAdmin')
       ORDER BY full_name ASC`,
    )

    return NextResponse.json(staff)
  } catch (error: any) {
    console.error("[v0] Error fetching staff:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
