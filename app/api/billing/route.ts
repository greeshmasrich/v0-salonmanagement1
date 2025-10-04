import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/billing - List all billing records
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const billingRecords = await query(`
      SELECT 
        b.*,
        JSON_OBJECT('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone) as customer,
        JSON_OBJECT(
          'id', a.id, 
          'appointment_date', a.appointment_date, 
          'start_time', a.start_time,
          'service', JSON_OBJECT('name', srv.name, 'price', srv.price),
          'staff', JSON_OBJECT('full_name', s.full_name)
        ) as appointment
      FROM billing b
      LEFT JOIN users c ON b.customer_id = c.id
      LEFT JOIN appointments a ON b.appointment_id = a.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN users s ON a.staff_id = s.id
      ORDER BY b.created_at DESC
    `)

    return NextResponse.json(billingRecords)
  } catch (error: any) {
    console.error("[v0] Error fetching billing records:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/billing - Create new bill
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      appointment_id,
      customer_id,
      total_amount,
      discount_amount,
      final_amount,
      payment_status,
      payment_method,
      payment_date,
      notes,
    } = body

    const result = await query(
      `INSERT INTO billing (appointment_id, customer_id, total_amount, discount_amount, final_amount, payment_status, payment_method, payment_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment_id,
        customer_id,
        total_amount,
        discount_amount || 0,
        final_amount,
        payment_status,
        payment_method || null,
        payment_date || null,
        notes || null,
      ],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "Bill created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating bill:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
