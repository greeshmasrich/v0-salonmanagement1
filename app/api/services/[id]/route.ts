import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// PUT /api/services/[id] - Update service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, duration, price, is_active } = body

    await query(
      `UPDATE services 
       SET name = ?, description = ?, duration = ?, price = ?, is_active = ?
       WHERE id = ?`,
      [name, description || null, duration, price, is_active, params.id],
    )

    return NextResponse.json({ message: "Service updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await query(`DELETE FROM services WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting service:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
