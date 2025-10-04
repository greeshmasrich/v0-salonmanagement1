import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db/mysql"
import { verifyAuth } from "@/lib/db/auth"

// PUT /api/billing/[id] - Update billing record
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { total_amount, discount_amount, final_amount, payment_status, payment_method, payment_date, notes } = body

    await query(
      `UPDATE billing 
       SET total_amount = ?, discount_amount = ?, final_amount = ?, 
           payment_status = ?, payment_method = ?, payment_date = ?, notes = ?
       WHERE id = ?`,
      [
        total_amount,
        discount_amount || 0,
        final_amount,
        payment_status,
        payment_method || null,
        payment_date || null,
        notes || null,
        params.id,
      ],
    )

    return NextResponse.json({ message: "Bill updated successfully" })
  } catch (error: any) {
    console.error("[v0] Error updating bill:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/billing/[id] - Delete billing record
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await query(`DELETE FROM billing WHERE id = ?`, [params.id])

    return NextResponse.json({ message: "Bill deleted successfully" })
  } catch (error: any) {
    console.error("[v0] Error deleting bill:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
