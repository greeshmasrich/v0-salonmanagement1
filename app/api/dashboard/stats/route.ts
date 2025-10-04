import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Today's appointments
    const todayAppointmentsResult = await query(
      "SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?",
      [today],
    )
    const todayAppointments = Array.isArray(todayAppointmentsResult) ? todayAppointmentsResult[0]?.count || 0 : 0

    // Total customers
    const totalCustomersResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'User'")
    const totalCustomers = Array.isArray(totalCustomersResult) ? totalCustomersResult[0]?.count || 0 : 0

    // Monthly revenue
    const monthlyRevenueResult = await query(`
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM billing
      WHERE payment_status = 'Paid'
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `)
    const monthlyRevenue = Array.isArray(monthlyRevenueResult) ? monthlyRevenueResult[0]?.total || 0 : 0

    // Last month revenue
    const lastMonthRevenueResult = await query(`
      SELECT COALESCE(SUM(final_amount), 0) as total
      FROM billing
      WHERE payment_status = 'Paid'
      AND MONTH(created_at) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
      AND YEAR(created_at) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
    `)
    const lastMonthRevenue = Array.isArray(lastMonthRevenueResult) ? lastMonthRevenueResult[0]?.total || 0 : 0

    const revenueGrowth = lastMonthRevenue > 0 ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return NextResponse.json({
      todayAppointments,
      totalCustomers,
      monthlyRevenue,
      revenueGrowth,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching dashboard stats:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
