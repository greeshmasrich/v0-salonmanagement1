import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/dashboard/appointments-chart - Get appointments chart data
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get appointments by status
    const appointmentsData = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM appointments
      WHERE appointment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      GROUP BY status
    `)

    return NextResponse.json(appointmentsData)
  } catch (error: any) {
    console.error("[v0] Error fetching appointments chart data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
