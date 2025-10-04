import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// PUT /api/chairs/[id] - Update chair
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // const user = await verifyAuth(request)
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    // if (user.role !== "SuperAdmin" && user.role !== "Admin") {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const body = await request.json()
    const { chair_number, description, is_active } = body

    await query(
      `UPDATE chairs 
       SET chair_number = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [chair_number, description || null, is_active, params.id],
    )

    return NextResponse.json({ message: "Chair updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating chair:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/chairs/[id] - Delete chair
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "SuperAdmin" && user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await query(`DELETE FROM chairs WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "Chair deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting chair:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
