"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X, Plus, CheckCheck, Play } from "lucide-react"
import type { AppointmentServiceItem, Service } from "@/lib/types"

type Row = AppointmentServiceItem & {
  service?: Service
  appointment?: {
    id: string
    appointment_date: string
    start_time: string
    status: string
    customer?: { id: string; full_name: string }
  }
}

export function StaffTodayServices() {
  const [rows, setRows] = useState<Row[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [appointmentsToday, setAppointmentsToday] = useState<{ id: string; start_time: string; customer: any }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [r, s, a] = await Promise.all([
        fetch("/api/appointment-services?today=1"),
        fetch("/api/services?active=true"),
        fetch("/api/appointments"),
      ])
      if (!r.ok) throw new Error("Failed to load today's services")
      const data = await r.json()
      setRows(data || [])
      if (s.ok) setServices(await s.json())
      if (a.ok) {
        const all = await a.json()
        const today = all.filter((ap: any) => {
          const d = new Date(ap.appointment_date)
          const now = new Date()
          return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
        })
        setAppointmentsToday(
          today.map((ap: any) => ({
            id: ap.id,
            start_time: ap.start_time,
            customer: ap.customer || { full_name: ap.customer_name },
          })),
        )
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>()
    rows.forEach((r) => {
      const aid = r.appointment_id
      if (!m.has(aid)) m.set(aid, [])
      m.get(aid)!.push(r)
    })
    return Array.from(m.entries())
  }, [rows])

  const updateStatus = async (id: string, next: "Pending" | "Ongoing" | "Completed") => {
    const res = await fetch("/api/appointment-services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    })
    if (res.ok) fetchData()
  }

  const removeItem = async (id: string) => {
    const res = await fetch(`/api/appointment-services?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    if (res.ok) fetchData()
  }

  function AddServiceDialog() {
    const [open, setOpen] = useState(false)
    const [appointmentId, setAppointmentId] = useState("")
    const [serviceId, setServiceId] = useState("")

    const handleAdd = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!appointmentId || !serviceId) return
      const id = crypto.randomUUID()
      const svc = services.find((s) => s.id === serviceId)
      await fetch("/api/appointment-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          appointment_id: appointmentId,
          service_id: serviceId,
          assigned_staff_id: undefined, // default current staff on server if needed or leave null
          status: "Pending",
          price: svc?.price,
          duration: svc?.duration,
        }),
      })
      setOpen(false)
      setAppointmentId("")
      setServiceId("")
      fetchData()
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add service to today's appointment</DialogTitle>
            <DialogDescription>Select appointment and service to add</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Appointment</label>
              <Select value={appointmentId} onValueChange={setAppointmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick appointment" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentsToday.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {(a.customer?.full_name as string) || "Customer"} • {a.start_time?.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service</label>
              <Select value={serviceId} onValueChange={setServiceId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} • ₹{Number(s.price).toFixed(0)} ({s.duration}m)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const cls =
      status === "Completed"
        ? "bg-primary/10 text-primary"
        : status === "Ongoing"
          ? "bg-yellow-500/10 text-yellow-600"
          : "bg-muted text-foreground/60"
    return <Badge className={cls}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>My Services Today</CardTitle>
        <div className="flex items-center gap-2">
          <AddServiceDialog />
          <Button variant="outline" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        <div className="space-y-6">
          {grouped.map(([appointmentId, items]) => (
            <div key={appointmentId} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Appointment #{appointmentId.slice(0, 8)} •{" "}
                  {(items[0]?.appointment?.customer?.full_name as string) || "Customer"} •{" "}
                  {items[0]?.appointment?.start_time?.slice(0, 5)}
                </div>
              </div>
              <div className="space-y-3">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <div className="text-sm font-medium">{it.service?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ₹{Number(it.price ?? it.service?.price ?? 0).toFixed(0)} •{" "}
                        {(it.duration ?? it.service?.duration ?? 0) as number}m
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={it.status} />
                      <Button
                        size="icon"
                        variant="outline"
                        title="Mark Ongoing"
                        onClick={() => updateStatus(it.id, "Ongoing")}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        title="Mark Completed"
                        onClick={() => updateStatus(it.id, "Completed")}
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" title="Remove" onClick={() => removeItem(it.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-sm text-muted-foreground">No items</p>}
              </div>
            </div>
          ))}
          {grouped.length === 0 && <p className="text-sm text-muted-foreground">No services assigned today.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
