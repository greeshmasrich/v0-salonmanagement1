"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import type { Appointment } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateBillDialogProps {
  unbilledAppointments: Appointment[]
}

export function CreateBillDialog({ unbilledAppointments }: CreateBillDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    appointment_id: "",
    discount_amount: "0",
    payment_method: "",
    payment_status: "Pending",
    notes: "",
  })

  const selectedAppointment = unbilledAppointments.find((apt) => apt.id === formData.appointment_id)
  const servicePrice = selectedAppointment ? Number((selectedAppointment.service as any)?.price || 0) : 0
  const discountAmount = Number(formData.discount_amount) || 0
  const finalAmount = Math.max(0, servicePrice - discountAmount)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!selectedAppointment) throw new Error("Please select an appointment")

      const response = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: formData.appointment_id,
          customer_id: selectedAppointment.customer_id,
          total_amount: servicePrice,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          payment_status: formData.payment_status,
          payment_method: formData.payment_method || null,
          payment_date: formData.payment_status === "Paid" ? new Date().toISOString() : null,
          notes: formData.notes || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create bill")
      }

      setOpen(false)
      router.refresh()
      setFormData({
        appointment_id: "",
        discount_amount: "0",
        payment_method: "",
        payment_status: "Pending",
        notes: "",
      })
    } catch (err: any) {
      setError(err.message || "Failed to create bill")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Bill
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Bill</DialogTitle>
          <DialogDescription>Generate a bill for a completed appointment</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="appointment_id">Appointment</Label>
            <Select
              value={formData.appointment_id}
              onValueChange={(value) => setFormData({ ...formData, appointment_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select appointment" />
              </SelectTrigger>
              <SelectContent>
                {unbilledAppointments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {(apt.customer as any)?.full_name} - {(apt.service as any)?.name} (
                    {new Date(apt.appointment_date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAppointment && (
            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {(selectedAppointment.customer as any)?.full_name}
                </div>
                <div>
                  <span className="font-medium">Service:</span> {(selectedAppointment.service as any)?.name}
                </div>
                <div>
                  <span className="font-medium">Staff:</span> {(selectedAppointment.staff as any)?.full_name}
                </div>
                <div>
                  <span className="font-medium">Service Price:</span> ₹{servicePrice.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="discount_amount">Discount Amount (₹)</Label>
            <Input
              id="discount_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.discount_amount}
              onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
            />
          </div>

          <div className="rounded-lg border p-4 bg-primary/5">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Final Amount:</span>
              <span className="text-2xl font-bold">₹{finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_status === "Paid" && (
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Wallet">Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.appointment_id}>
              {loading ? "Creating..." : "Create Bill"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
