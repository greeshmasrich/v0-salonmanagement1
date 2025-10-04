import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { hashPassword, createSession } from "@/lib/db/auth"
import { randomUUID } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, role } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json({ error: "Email, password, and full name are required" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [email, passwordHash, full_name, phone || null, role || "User"],
    )

    // Get the inserted user's ID
    const userId = result.insertId

    // Create session
    await createSession(userId)

    return NextResponse.json({
      user: {
        id: userId,
        email,
        full_name,
        phone,
        role: role || "User",
      },
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
