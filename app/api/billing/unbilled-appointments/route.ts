import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/billing/unbilled-appointments - Get completed appointments without billing
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const unbilledAppointments = await query(`
      SELECT 
        a.*,
        JSON_OBJECT('id', c.id, 'full_name', c.full_name, 'email', c.email) as customer,
        JSON_OBJECT('id', srv.id, 'name', srv.name, 'price', srv.price) as service,
        JSON_OBJECT('full_name', s.full_name) as staff
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN users s ON a.staff_id = s.id
      WHERE a.status = 'Completed'
      AND a.id NOT IN (SELECT appointment_id FROM billing WHERE appointment_id IS NOT NULL)
      ORDER BY a.appointment_date DESC
    `)

    return NextResponse.json(unbilledAppointments)
  } catch (error: any) {
    console.error("[v0] Error fetching unbilled appointments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
