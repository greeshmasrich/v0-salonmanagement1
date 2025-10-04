import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth, hashPassword } from "@/lib/db/auth"

// GET /api/users - List all users
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")

    let sql = "SELECT id, email, full_name, phone, role, is_active, created_at FROM users"
    const params: any[] = []

    if (role) {
      sql += " WHERE role = ?"
      params.push(role)
    }

    sql += " ORDER BY created_at DESC"

    const users = await query(sql, params)

    return NextResponse.json(users)
  } catch (error: any) {
    console.error("[v0] Error fetching users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, phone, role, is_active } = body

    // Check if email already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ?", [email])
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const result = await query(
      `INSERT INTO users (email, password, full_name, phone, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, full_name, phone || null, role || "User", is_active !== false],
    )

    return NextResponse.json({ id: (result as any).insertId, message: "User created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
