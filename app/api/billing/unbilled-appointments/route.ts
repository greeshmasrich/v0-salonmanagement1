import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/billing/unbilled-appointments - Get appointments with all services completed and not billed
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
        -- primary service/staff retained for backwards compatibility
        JSON_OBJECT('id', srv.id, 'name', srv.name, 'price', srv.price) as service,
        JSON_OBJECT('full_name', s.full_name) as staff,
        -- services rollup for billing UI
        COALESCE(
          JSON_ARRAYAGG(
            CASE WHEN asi.id IS NULL THEN NULL ELSE
              JSON_OBJECT(
                'id', asi.id,
                'status', asi.status,
                'price', asi.price,
                'duration', asi.duration,
                'service', JSON_OBJECT('id', sv.id, 'name', sv.name, 'price', sv.price),
                'assigned_staff', JSON_OBJECT('id', us.id, 'full_name', us.full_name)
              )
            END
          ), JSON_ARRAY()
        ) as items
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN users s ON a.staff_id = s.id
      LEFT JOIN appointment_services asi ON asi.appointment_id = a.id
      LEFT JOIN services sv ON sv.id = asi.service_id
      LEFT JOIN users us ON us.id = asi.assigned_staff_id
      WHERE a.id NOT IN (SELECT appointment_id FROM billing WHERE appointment_id IS NOT NULL)
      GROUP BY a.id
      HAVING 
        JSON_LENGTH(items) > 0 AND
        SUM(CASE WHEN JSON_EXTRACT(items, '$[*].status') IS NULL THEN 0 ELSE 0 END) = 0 AND
        SUM(asi.status = 'Completed') = COUNT(asi.id)
      ORDER BY a.appointment_date DESC
    `)

    return NextResponse.json(unbilledAppointments)
  } catch (error: any) {
    console.error("[v0] Error fetching unbilled appointments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
