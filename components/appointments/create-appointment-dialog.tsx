"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
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
import type { Service, User } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select"

type Category = { id: string; name: string }
type Subcategory = { id: string; category_id: string; name: string }

interface CreateAppointmentDialogProps {
  // ... existing props replaced: services list still accepted for compatibility
  services: Service[]
  staff: User[]
  chairs: { id: string; chair_number: string }[]
  currentUser: User | null
}

export function CreateAppointmentDialog({ services, staff, chairs, currentUser }: CreateAppointmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [subcats, setSubcats] = useState<Subcategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcat, setSelectedSubcat] = useState("")
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([])
  const [preferredStaffIds, setPreferredStaffIds] = useState<string[]>([])

  const [formData, setFormData] = useState({
    chair_id: "",
    appointment_date: "",
    start_time: "",
    notes: "",
    customer_full_name: "",
    customer_email: "",
    customer_phone: "",
  })

  useEffect(() => {
    const run = async () => {
      try {
        const [catsRes, subRes] = await Promise.all([
          fetch("/api/service-categories"),
          fetch("/api/service-subcategories"),
        ])
        if (catsRes.ok) setCategories(await catsRes.json())
        if (subRes.ok) setSubcats(await subRes.json())
      } catch (e) {
        // ignore
      }
    }
    run()
  }, [])

  const serviceOptions: MultiSelectOption[] = useMemo(() => {
    return services
      .filter((s: any) => !selectedSubcat || s.subcategory_id === selectedSubcat)
      .map((s: any) => ({
        value: s.id,
        label: `${s.name} • ₹${s.price} (${s.duration}m)`,
        group: (subcats.find((sc) => sc.id === s.subcategory_id)?.name as string) || "Services",
      }))
  }, [services, subcats, selectedSubcat])

  const staffOptions: MultiSelectOption[] = useMemo(() => {
    return staff.map((u) => ({ value: u.id, label: u.full_name, group: u.role }))
  }, [staff])

  const filteredSubcats = useMemo(
    () => subcats.filter((sc) => !selectedCategory || sc.category_id === selectedCategory),
    [subcats, selectedCategory],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (selectedServiceIds.length === 0) throw new Error("Select at least one service")
      if (!formData.appointment_date || !formData.start_time) throw new Error("Select date and start time")

      const body: any = {
        chair_id: formData.chair_id && formData.chair_id !== "none" ? formData.chair_id : null,
        appointment_date: formData.appointment_date,
        start_time: formData.start_time,
        notes: formData.notes || null,
        service_ids: selectedServiceIds,
        preferred_staff_ids: preferredStaffIds,
      }

      if (currentUser?.role === "User") {
        body.customer_id = currentUser.id
      } else {
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
        chair_id: "",
        appointment_date: "",
        start_time: "",
        notes: "",
        customer_full_name: "",
        customer_email: "",
        customer_phone: "",
      })
      setSelectedCategory("")
      setSelectedSubcat("")
      setSelectedServiceIds([])
      setPreferredStaffIds([])
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
            Select services via Category → Subcategory, choose preferred staff, and we’ll auto-create customers if
            needed.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(v) => {
                  setSelectedCategory(v)
                  setSelectedSubcat("")
                  setSelectedServiceIds([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subcategory</Label>
              <Select
                value={selectedSubcat}
                onValueChange={(v) => {
                  setSelectedSubcat(v)
                  setSelectedServiceIds([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcats.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chair (Optional)</Label>
              <Select value={formData.chair_id} onValueChange={(v) => setFormData({ ...formData, chair_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chair" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No chair assigned</SelectItem>
                  {chairs.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.chair_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Services</Label>
            <MultiSelect
              options={serviceOptions}
              value={selectedServiceIds}
              onChange={setSelectedServiceIds}
              placeholder="Pick one or more services"
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Staff</Label>
            <MultiSelect
              options={staffOptions}
              value={preferredStaffIds}
              onChange={setPreferredStaffIds}
              placeholder="Select preferred staff (optional)"
            />
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
