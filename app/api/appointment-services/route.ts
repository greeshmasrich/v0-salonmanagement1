import { NextResponse, type NextRequest } from "next/server"
import { query, queryOne } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const appointment_id = searchParams.get("appointment_id")
    const for_today = searchParams.get("today") === "1"
    const for_staff = searchParams.get("staff_id") || (for_today ? user.id : null)

    let sql = `
      SELECT asi.*, 
        JSON_OBJECT('id', s.id, 'name', s.name, 'duration', s.duration, 'price', s.price) as service,
        JSON_OBJECT('id', u.id, 'full_name', u.full_name) as assigned_staff,
        JSON_OBJECT(
          'id', a.id, 
          'appointment_date', a.appointment_date, 
          'start_time', a.start_time, 
          'end_time', a.end_time,
          'status', a.status,
          'customer', JSON_OBJECT('id', cu.id, 'full_name', cu.full_name)
        ) as appointment
      FROM appointment_services asi
      LEFT JOIN services s ON asi.service_id = s.id
      LEFT JOIN users u ON asi.assigned_staff_id = u.id
      LEFT JOIN appointments a ON a.id = asi.appointment_id
      LEFT JOIN users cu ON cu.id = a.customer_id
    `
    const params: any[] = []

    const where: string[] = []
    if (appointment_id) {
      where.push("asi.appointment_id = ?")
      params.push(appointment_id)
    }
    if (for_today && for_staff) {
      where.push("asi.assigned_staff_id = ?")
      params.push(for_staff)
      where.push("a.appointment_date = CURDATE()")
    }
    if (where.length) sql += " WHERE " + where.join(" AND ")
    sql += " ORDER BY a.start_time ASC, asi.created_at ASC"

    const rows = await query(sql, params)
    return NextResponse.json(rows)
  } catch (e: any) {
    console.error("[v0] appointment-services GET error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const {
      id,
      appointment_id,
      service_id,
      assigned_staff_id,
      status = "Pending",
      price,
      duration,
      notes,
    } = await request.json()
    await query(
      `INSERT INTO appointment_services (id, appointment_id, service_id, assigned_staff_id, status, price, duration, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        appointment_id,
        service_id,
        assigned_staff_id || null,
        status,
        price ?? null,
        duration ?? null,
        notes ?? null,
      ],
    )
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] appointment-services POST error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id, status, assigned_staff_id, notes } = await request.json()
    const row = await queryOne<any>("SELECT appointment_id FROM appointment_services WHERE id = ?", [id])
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    // Allow staff to update their assigned items; admins can manage all
    if (user.role === "Staff") {
      const owns = await queryOne<any>(
        "SELECT 1 FROM appointment_services WHERE id = ? AND (assigned_staff_id = ? OR assigned_staff_id IS NULL)",
        [id, user.id],
      )
      if (!owns) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await query(
      `UPDATE appointment_services SET 
        status = COALESCE(?, status),
        assigned_staff_id = COALESCE(?, assigned_staff_id),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status ?? null, assigned_staff_id ?? null, notes ?? null, id],
    )

    // After updating item, recompute parent appointment status:
    const stats = await queryOne<any>(
      `SELECT 
         SUM(status = 'Completed') as completed,
         SUM(status = 'Ongoing') as ongoing,
         COUNT(*) as total
       FROM appointment_services 
       WHERE appointment_id = ?`,
      [row.appointment_id],
    )
    if (stats?.total > 0 && Number(stats.completed) === Number(stats.total)) {
      await query("UPDATE appointments SET status = 'Completed' WHERE id = ?", [row.appointment_id])
    } else if (Number(stats.ongoing) > 0) {
      // Keep 'Confirmed' to represent in-progress at appointment level
      await query("UPDATE appointments SET status = 'Confirmed' WHERE id = ?", [row.appointment_id])
    } else {
      await query("UPDATE appointments SET status = 'Pending' WHERE id = ?", [row.appointment_id])
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] appointment-services PUT error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
    await query("DELETE FROM appointment_services WHERE id = ?", [id])
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error("[v0] appointment-services DELETE error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
