import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/dashboard/recent-appointments - Get recent appointments
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recentAppointments = await query(`
      SELECT 
        a.*,
        JSON_OBJECT('full_name', c.full_name) as customer,
        JSON_OBJECT('name', s.name) as service,
        JSON_OBJECT('full_name', st.full_name) as staff
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN users st ON a.staff_id = st.id
      ORDER BY a.created_at DESC
      LIMIT 5
    `)

    return NextResponse.json(recentAppointments)
  } catch (error: any) {
    console.error("[v0] Error fetching recent appointments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
