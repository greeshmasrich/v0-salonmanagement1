"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, isSameDay, isSameWeek, isSameMonth, startOfWeek, addDays } from "date-fns"
import { UserIcon, Clock3 } from "lucide-react"
import type { Appointment, User } from "@/lib/types"
import { UpdateAppointmentDialog } from "./update-appointment-dialog"

interface AppointmentListProps {
  appointments: Appointment[]
  currentUser: User | null
}

export function AppointmentList({ appointments, currentUser }: AppointmentListProps) {
  const [view, setView] = useState<"day" | "week" | "month">("day")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate])
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const isInView = (aptDate: Date) => {
    if (view === "day") return isSameDay(aptDate, selectedDate)
    if (view === "week") return isSameWeek(aptDate, selectedDate, { weekStartsOn: 1 })
    return isSameMonth(aptDate, selectedDate)
  }

  const normalized = (a: any) => {
    const date = new Date(a.appointment_date)
    return {
      id: a.id,
      date,
      start_time: a.start_time,
      end_time: a.end_time,
      status: a.status,
      notes: a.notes,
      customerName: (a.customer as any)?.full_name || a.customer_name || a.customer_full_name || "Customer",
      serviceName: (a.service as any)?.name || a.service_name || "Service",
      serviceDuration: (a.service as any)?.duration || a.service_duration || 0,
      staffName: (a.staff as any)?.full_name || a.staff_name || "",
      chairNumber: (a.chair as any)?.chair_number || a.chair_number || "",
      staff_id: a.staff_id,
    }
  }

  const filtered = useMemo(() => {
    return appointments
      .map(normalized)
      .filter((apt) => isInView(apt.date))
      .sort((a, b) => {
        // Sort by date then start_time
        const d = a.date.getTime() - b.date.getTime()
        if (d !== 0) return d
        return (a.start_time || "").localeCompare(b.start_time || "")
      })
  }, [appointments, selectedDate, view])

  const countLabel = useMemo(() => {
    const n = filtered.length
    if (view === "day") return `${n} appointment${n === 1 ? "" : "s"} today`
    if (view === "week") return `${n} appointment${n === 1 ? "" : "s"} this week`
    return `${n} appointment${n === 1 ? "" : "s"} this month`
  }, [filtered.length, view])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/10 text-green-600 hover:bg-green-500/20"
      case "Completed":
        return "bg-primary/10 text-primary hover:bg-primary/20"
      case "Pending":
        return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
      case "Cancelled":
        return "bg-red-500/10 text-red-600 hover:bg-red-500/20"
      default:
        return "bg-muted text-foreground/60"
    }
  }

  const formatTime = (t?: string) => (t ? t.slice(0, 5) : "--:--")

  return (
    <Card className="h-full">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>Appointments</CardTitle>
        </div>

        {/* Date strip */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {weekDays.map((day) => {
            const active = isSameDay(day, selectedDate)
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`rounded-md px-3 py-2 text-center min-w-[52px] transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "bg-accent text-foreground/80 hover:bg-accent/70"
                }`}
                aria-pressed={active}
              >
                <div className="text-xs opacity-80">{format(day, "EEE")}</div>
                <div className="text-sm font-semibold">{format(day, "d")}</div>
              </button>
            )
          })}
        </div>

        {/* View tabs */}
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="grid grid-cols-3 w-full max-w-xs">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="text-sm text-muted-foreground">{countLabel}</div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {filtered.map((a) => {
              const duration = Number.isFinite(a.serviceDuration) ? a.serviceDuration : 0
              return (
                <div key={a.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>
                          {formatTime(a.start_time)} <span className="opacity-70">({duration}m)</span>
                        </span>
                      </div>
                      <div className="mt-1 text-base font-semibold">{a.customerName}</div>
                      <div className="text-sm text-muted-foreground">{a.serviceName}</div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <UserIcon className="h-3.5 w-3.5" />
                        <span>{a.staffName}</span>
                        {a.chairNumber && (
                          <>
                            <span className="mx-1">•</span>
                            <span>Chair {a.chairNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(a.status)}>{a.status}</Badge>
                  </div>
                  {a.notes && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      <span className="font-medium">Notes:</span> {a.notes}
                    </p>
                  )}
                  {(currentUser?.role === "SuperAdmin" ||
                    currentUser?.role === "Admin" ||
                    currentUser?.id === a.staff_id) && <UpdateAppointmentDialog appointment={a} />}
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No appointments found</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
