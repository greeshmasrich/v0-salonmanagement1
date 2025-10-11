import { type NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db/mysql"
import { verifyAuth, hashPassword } from "@/lib/db/auth"
import { randomUUID } from "crypto"

// GET /api/appointments - List all appointments
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointments = await query(`
      SELECT 
        a.*,
        JSON_OBJECT('id', c.id, 'full_name', c.full_name, 'email', c.email, 'phone', c.phone) as customer,
        JSON_OBJECT('id', s.id, 'full_name', s.full_name) as staff,
        JSON_OBJECT('id', srv.id, 'name', srv.name, 'duration', srv.duration, 'price', srv.price) as service,
        JSON_OBJECT('id', ch.id, 'chair_number', ch.chair_number) as chair,
        COALESCE(
          JSON_ARRAYAGG(
            CASE 
              WHEN asi.id IS NULL THEN NULL
              ELSE JSON_OBJECT(
                'id', asi.id,
                'service', JSON_OBJECT('id', srv2.id, 'name', srv2.name, 'duration', srv2.duration, 'price', srv2.price),
                'assigned_staff', JSON_OBJECT('id', u2.id, 'full_name', u2.full_name),
                'status', asi.status
              )
            END
          ), JSON_ARRAY()
        ) as services_array
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN users s ON a.staff_id = s.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN chairs ch ON a.chair_id = ch.id
      LEFT JOIN appointment_services asi ON asi.appointment_id = a.id
      LEFT JOIN services srv2 ON asi.service_id = srv2.id
      LEFT JOIN users u2 ON asi.assigned_staff_id = u2.id
      GROUP BY a.id
      ORDER BY a.appointment_date DESC, a.start_time DESC
    `)

    return NextResponse.json(appointments)
  } catch (error: any) {
    console.error("[v0] Error fetching appointments:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let {
      customer_id,
      customer,
      staff_id,
      service_id,
      service_ids,
      preferred_staff_ids,
      chair_id,
      appointment_date,
      start_time,
      end_time,
      notes,
    } = body

    if (chair_id === "none") chair_id = null

    // Upsert customer (existing logic)
    if (!customer_id) {
      const full_name: string | undefined = customer?.full_name
      const email: string | null | undefined = customer?.email ?? null
      const phone: string | null | undefined = customer?.phone ?? null

      if (!full_name || (!email && !phone)) {
        return NextResponse.json(
          { error: "Customer name and at least one of email or phone are required" },
          { status: 400 },
        )
      }

      let existing = null as any
      if (email && phone) {
        existing = await queryOne("SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1", [email, phone])
      } else if (email) {
        existing = await queryOne("SELECT id FROM users WHERE email = ? LIMIT 1", [email])
      } else if (phone) {
        existing = await queryOne("SELECT id FROM users WHERE phone = ? LIMIT 1", [phone])
      }

      if (existing?.id) {
        customer_id = existing.id
      } else {
        const randomPlain = Math.random().toString(36).slice(2, 12)
        const pwHash = await hashPassword(randomPlain)
        const newId = randomUUID()
        await query(
          `INSERT INTO users (id, email, password_hash, full_name, phone, role)
           VALUES (?, ?, ?, ?, ?, 'User')`,
          [newId, email, pwHash, full_name, phone || null],
        )
        customer_id = newId
      }
    }

    // Normalize arrays
    const svcIds: string[] =
      Array.isArray(service_ids) && service_ids.length ? service_ids : service_id ? [service_id] : []
    const prefStaffIds: string[] = Array.isArray(preferred_staff_ids) ? preferred_staff_ids : staff_id ? [staff_id] : []

    if (svcIds.length === 0) {
      return NextResponse.json({ error: "At least one service is required" }, { status: 400 })
    }

    // Compute end_time by max duration across selected services if not provided
    if (!end_time) {
      const placeholders = svcIds.map(() => "?").join(",")
      const rows = await query<{ duration: number }[]>(
        `SELECT duration FROM services WHERE id IN (${placeholders})`,
        svcIds,
      )
      const total = Math.max(...rows.map((r) => Number(r.duration || 0)))
      const [h, m] = String(start_time).split(":").map(Number)
      const startMinutes = h * 60 + m
      const endMinutes = startMinutes + (Number.isFinite(total) ? total : 0)
      const eh = Math.floor(endMinutes / 60)
      const em = endMinutes % 60
      end_time = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`
    }

    // Create appointment
    const appointmentId = randomUUID()
    const primaryService = svcIds[0]
    const primaryStaff = prefStaffIds[0] || null

    await query(
      `INSERT INTO appointments (id, customer_id, staff_id, service_id, chair_id, appointment_date, start_time, end_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        appointmentId,
        customer_id,
        primaryStaff,
        primaryService,
        chair_id || null,
        appointment_date,
        start_time,
        end_time,
        notes || null,
      ],
    )

    // Create appointment_service items
    for (let i = 0; i < svcIds.length; i++) {
      const sid = svcIds[i]
      const assigned = prefStaffIds[i] || prefStaffIds[0] || null
      // snapshot price/duration
      const svc = await queryOne<any>("SELECT price, duration FROM services WHERE id = ? LIMIT 1", [sid])
      await query(
        `INSERT INTO appointment_services (id, appointment_id, service_id, assigned_staff_id, status, price, duration, notes)
         VALUES (?, ?, ?, ?, 'Pending', ?, ?, NULL)`,
        [randomUUID(), appointmentId, sid, assigned, svc?.price ?? null, svc?.duration ?? null],
      )
    }

    return NextResponse.json({ id: appointmentId, message: "Appointment created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
