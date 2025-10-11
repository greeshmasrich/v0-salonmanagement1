import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { hashPassword, createSession } from "@/lib/db/auth"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role, designation_id, service_ids } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Ensure email is unique
    const exists = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email])
    if (Array.isArray(exists) && exists.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const newId = randomUUID()

    // include designation_id if provided
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, ${designation_id ? "designation_id," : ""} created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ${designation_id ? "?, " : ""} NOW(), NOW())`,
      designation_id
        ? [newId, email, passwordHash, full_name, phone || null, role || "User", designation_id]
        : [newId, email, passwordHash, full_name, phone || null, role || "User"],
    )

    // If registering staff with services, save skills
    if (role === "Staff" && Array.isArray(service_ids) && service_ids.length > 0) {
      for (const sid of service_ids) {
        await query("INSERT IGNORE INTO staff_services (staff_id, service_id) VALUES (?, ?)", [newId, sid])
      }
    }

    await createSession(newId)

    return NextResponse.json({
      user: {
        id: newId,
        email,
        full_name,
        phone,
        role: role || "User",
        designation_id: designation_id || null,
      },
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
