import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/dashboard/popular-services - Get popular services data
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get top 5 popular services
    const servicesData = await query(`
      SELECT 
        s.name,
        COUNT(a.id) as count
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.appointment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
      GROUP BY s.id, s.name
      ORDER BY count DESC
      LIMIT 5
    `)

    return NextResponse.json(servicesData)
  } catch (error: any) {
    console.error("[v0] Error fetching popular services data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
