import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// GET /api/appointments/[id] - Get single appointment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointments = await query(
      `SELECT 
        a.*,
        JSON_OBJECT('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone) as customer,
        JSON_OBJECT('id', s.id, 'full_name', s.full_name) as staff,
        JSON_OBJECT('id', srv.id, 'name', srv.name, 'duration', srv.duration, 'price', srv.price) as service,
        JSON_OBJECT('id', ch.id, 'chair_number', ch.chair_number) as chair
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN users s ON a.staff_id = s.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN chairs ch ON a.chair_id = ch.id
      WHERE a.id = ?`,
      [params.id],
    )

    if (!Array.isArray(appointments) || appointments.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(appointments[0])
  } catch (error: any) {
    console.error("[v0] Error fetching appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/appointments/[id] - Update appointment
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { customer_id, staff_id, service_id, chair_id, appointment_date, start_time, end_time, status, notes } = body

    await query(
      `UPDATE appointments 
       SET customer_id = ?, staff_id = ?, service_id = ?, chair_id = ?, 
           appointment_date = ?, start_time = ?, end_time = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        customer_id,
        staff_id,
        service_id,
        chair_id || null,
        appointment_date,
        start_time,
        end_time,
        status,
        notes || null,
        params.id,
      ],
    )

    return NextResponse.json({ message: "Appointment updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/appointments/[id] - Delete appointment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await query(`DELETE FROM appointments WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "Appointment deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
