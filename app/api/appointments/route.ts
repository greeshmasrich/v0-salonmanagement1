import { type NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db/mysql"
import { verifyAuth, hashPassword } from "@/lib/db/auth"

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
        JSON_OBJECT('id', ch.id, 'chair_number', ch.chair_number) as chair
      FROM appointments a
      LEFT JOIN users c ON a.customer_id = c.id
      LEFT JOIN users s ON a.staff_id = s.id
      LEFT JOIN services srv ON a.service_id = srv.id
      LEFT JOIN chairs ch ON a.chair_id = ch.id
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
    // const user = await verifyAuth(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const body = await request.json()
    let {
      customer_id,
      customer, // { full_name, email?, phone? }
      staff_id,
      service_id,
      chair_id,
      appointment_date,
      start_time,
      end_time,
      notes,
    } = body

    // Normalize chair_id "none" -> null
    if (chair_id === "none") chair_id = null

    // If no customer_id provided, upsert customer by email or phone
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

      // Try to find existing user
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
        // Create new user with random password hash
        const randomPlain = Math.random().toString(36).slice(2, 12)
        const pwHash = await hashPassword(randomPlain)

        const result = await query(
          `INSERT INTO users (email, password_hash, full_name, phone, role)
           VALUES (?, ?, ?, ?, 'User')`,
          [email, pwHash, full_name, phone || null],
        )
        // MySQL returns insertId for AUTO_INCREMENT; if UUIDs are used, ignore insertId
        customer_id =
          (result as any).insertId || (await queryOne("SELECT id FROM users WHERE email = ? LIMIT 1", [email]))?.id
      }
    }

    // Compute end_time server-side if not provided
    if (!end_time) {
      const svc = await queryOne<{ duration: number }>("SELECT duration FROM services WHERE id = ?", [service_id])
      if (!svc) return NextResponse.json({ error: "Service not found" }, { status: 400 })

      const [h, m] = String(start_time).split(":").map(Number)
      const startMinutes = h * 60 + m
      const endMinutes = startMinutes + Number(svc.duration || 0)
      const eh = Math.floor(endMinutes / 60)
      const em = endMinutes % 60
      end_time = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`
    }

    const result = await query(
      `INSERT INTO appointments (customer_id, staff_id, service_id, chair_id, appointment_date, start_time, end_time, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [customer_id, staff_id, service_id, chair_id || null, appointment_date, start_time, end_time, notes || null],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "Appointment created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating appointment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
