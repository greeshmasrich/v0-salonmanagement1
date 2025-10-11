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
import type { Service, User, Chair } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CreateAppointmentDialogProps {
  services: Service[]
  staff: User[]
  chairs: Chair[]
  currentUser: User | null
}

export function CreateAppointmentDialog({ services, staff, chairs, currentUser }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    // when currentUser is a regular User, we use their id as customer
    staff_id: "",
    service_id: "",
    chair_id: "",
    appointment_date: "",
    start_time: "",
    notes: "",
    // customer fields (used when current user is NOT a "User")
    customer_full_name: "",
    customer_email: "",
    customer_phone: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get service duration to calculate end time
      debugger
      const service = services.find((s) => s.id == formData.service_id)
      if (!service) throw new Error("Service not found")

      // Calculate end time from start_time + duration
      const [hours, minutes] = formData.start_time.split(":").map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + service.duration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const end_time = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`

      const body: any = {
        staff_id: formData.staff_id,
        service_id: formData.service_id,
        chair_id: formData.chair_id && formData.chair_id !== "none" ? formData.chair_id : null, // handle "none"
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        end_time,
        status: "Pending",
        notes: formData.notes || null,
      }

      if (currentUser?.role === "User") {
        body.customer_id = currentUser.id
      } else {
        // Require at least name and one contact field
        if (!formData.customer_full_name || (!formData.customer_email && !formData.customer_phone)) {
          throw new Error("Please provide customer name and at least email or phone")
        }
        body.customer = {
          full_name: formData.customer_full_name,
          email: formData.customer_email || null,
          phone: formData.customer_phone || null,
        }
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create appointment")
      }

      setOpen(false)
      router.refresh()
      setFormData({
        staff_id: "",
        service_id: "",
        chair_id: "",
        appointment_date: "",
        start_time: "",
        notes: "",
        customer_full_name: "",
        customer_email: "",
        customer_phone: "",
      })
    } catch (err: any) {
      setError(err.message || "Failed to create appointment")
    } finally {
      setLoading(false)
    }
  }

  const showCustomerInputs = currentUser?.role !== "User"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment. Customers are created automatically if needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showCustomerInputs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="customer_full_name">Customer Name</Label>
                <Input
                  id="customer_full_name"
                  placeholder="Full name"
                  value={formData.customer_full_name}
                  onChange={(e) => setFormData({ ...formData, customer_full_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  placeholder="customer@email.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="customer_phone">Phone</Label>
                <Input
                  id="customer_phone"
                  placeholder="+1 555 123 4567"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="service_id">Service</Label>
            <Select
              value={formData.service_id}
              onValueChange={(value) => setFormData({ ...formData, service_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - ₹{service.price} ({service.duration} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_id">Staff Member</Label>
            <Select value={formData.staff_id} onValueChange={(value) => setFormData({ ...formData, staff_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.full_name} ({member.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chair_id">Chair (Optional)</Label>
            <Select value={formData.chair_id} onValueChange={(value) => setFormData({ ...formData, chair_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select chair" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No chair assigned</SelectItem>
                {chairs.map((chair) => (
                  <SelectItem key={chair.id} value={chair.id}>
                    {chair.chair_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date</Label>
              <Input
                id="appointment_date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
