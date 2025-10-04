import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth, hashPassword } from "@/lib/db/auth"

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await query(
      "SELECT id, email, full_name, phone, role, is_active, created_at FROM users WHERE id = ?",
      [params.id],
    )

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error: any) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin" && user.id !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, full_name, phone, role, is_active } = body

    let sql = "UPDATE users SET email = ?, full_name = ?, phone = ?"
    const queryParams: any[] = [email, full_name, phone || null]

    if (password) {
      const hashedPassword = await hashPassword(password)
      sql += ", password = ?"
      queryParams.push(hashedPassword)
    }

    if (user.role === "SuperAdmin" || user.role === "Admin") {
      sql += ", role = ?, is_active = ?"
      queryParams.push(role, is_active)
    }

    sql += " WHERE id = ?"
    queryParams.push(params.id)

    await query(sql, queryParams)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await query(`DELETE FROM users WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
