import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// PUT /api/availability/[id] - Update availability
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { staff_id, date, start_time, end_time, is_available } = body

    // Staff can only update their own availability
    if (user.role === "Staff" && staff_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await query(
      `UPDATE staff_availability 
       SET staff_id = ?, date = ?, start_time = ?, end_time = ?, is_available = ?
       WHERE id = ?`,
      [staff_id, date, start_time, end_time, is_available, params.id],
    )

    return NextResponse.json({ message: "Availability updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating availability:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/availability/[id] - Delete availability
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if staff owns this availability
    if (user.role === "Staff") {
      const records = await query("SELECT staff_id FROM staff_availability WHERE id = ?", [params.id])
      if (Array.isArray(records) && records.length > 0 && records[0].staff_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    await query(`DELETE FROM staff_availability WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "Availability deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting availability:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
