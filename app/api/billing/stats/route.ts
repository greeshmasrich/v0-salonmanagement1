import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/billing/stats - Get billing statistics
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Total revenue
    const totalRevenueResult = await query(`
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM billing
      WHERE payment_status = 'Paid'
    `)
    const totalRevenue = Array.isArray(totalRevenueResult) ? totalRevenueResult[0]?.total || 0 : 0

    // Pending payments
    const pendingResult = await query(`
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM billing
      WHERE payment_status = 'Pending'
    `)
    const pendingPayments = Array.isArray(pendingResult) ? pendingResult[0]?.total || 0 : 0

    // This month revenue
    const thisMonthResult = await query(`
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM billing
      WHERE payment_status = 'Paid'
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `)
    const thisMonthRevenue = Array.isArray(thisMonthResult) ? thisMonthResult[0]?.total || 0 : 0

    // Average bill amount
    const avgBillResult = await query(`
      SELECT COALESCE(AVG(final_amount), 0) as average
      FROM billing
      WHERE payment_status = 'Paid'
    `)
    const avgBillAmount = Array.isArray(avgBillResult) ? avgBillResult[0]?.average || 0 : 0

    return NextResponse.json({
      totalRevenue,
      pendingPayments,
      thisMonthRevenue,
      avgBillAmount,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching billing stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
