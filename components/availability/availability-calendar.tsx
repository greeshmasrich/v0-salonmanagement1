"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import type { StaffAvailability } from "@/lib/types"

interface AvailabilityCalendarProps {
  availability: StaffAvailability[]
}

export function AvailabilityCalendar({ availability }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i)

  const getAvailabilityForDay = (day: Date) => {
    return availability.filter((avail) => isSameDay(new Date(avail.date), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500"
      case "Unavailable":
        return "bg-red-500"
      case "Break":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}

          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="min-h-24 p-2" />
          ))}

          {daysInMonth.map((day) => {
            const dayAvailability = getAvailabilityForDay(day)
            const isToday = isSameDay(day, new Date())

            return (
              <div
                key={day.toISOString()}
                className={`min-h-24 rounded-lg border p-2 ${isToday ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="text-sm font-medium mb-1">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayAvailability.slice(0, 3).map((avail) => (
                    <div
                      key={avail.id}
                      className="text-xs p-1 rounded bg-muted hover:bg-muted/80 cursor-pointer truncate"
                      title={`${avail.start_time} - ${avail.end_time} (${avail.status})`}
                    >
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(avail.status)}`} />
                        <span className="truncate">{avail.start_time}</span>
                      </div>
                    </div>
                  ))}
                  {dayAvailability.length > 3 && (
                    <div className="text-xs text-muted-foreground">+{dayAvailability.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
