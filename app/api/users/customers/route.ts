import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/users/customers - Get all customers
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const customers = await query(
      `SELECT id, email, full_name, phone, role, is_active, created_at 
       FROM users 
       WHERE role = 'User'
       ORDER BY full_name ASC`,
    )

    return NextResponse.json(customers)
  } catch (error: any) {
    console.error("[v0] Error fetching customers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
