import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/dashboard/revenue-chart - Get revenue chart data
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get last 7 days revenue
    const revenueData = await query(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(final_amount), 0) as revenue
      FROM billing
      WHERE payment_status = 'Paid'
      AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

    return NextResponse.json(revenueData)
  } catch (error: any) {
    console.error("[v0] Error fetching revenue chart data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
