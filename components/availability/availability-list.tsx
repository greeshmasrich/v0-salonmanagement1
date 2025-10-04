"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import type { StaffAvailability, User } from "@/lib/types"
import { UpdateAvailabilityDialog } from "./update-availability-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AvailabilityListProps {
  availability: StaffAvailability[]
  currentUser: User | null
}

export function AvailabilityList({ availability, currentUser }: AvailabilityListProps) {
  const [filter, setFilter] = useState<"all" | "upcoming" | "today">("upcoming")

  const today = new Date().toISOString().split("T")[0]

  const filteredAvailability = availability.filter((avail) => {
    if (filter === "today") {
      return avail.date === today
    } else if (filter === "upcoming") {
      return avail.date >= today
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "Unavailable":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "Break":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Availability Schedule</CardTitle>
        <div className="flex gap-2">
          <Button variant={filter === "today" ? "default" : "outline"} size="sm" onClick={() => setFilter("today")}>
            Today
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </Button>
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {filteredAvailability.map((avail) => (
              <div key={avail.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{(avail.staff as any)?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(avail.date), "MMM dd, yyyy")}</p>
                  </div>
                  <Badge className={getStatusColor(avail.status)}>{avail.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Start:</span> {avail.start_time}
                  </div>
                  <div>
                    <span className="font-medium">End:</span> {avail.end_time}
                  </div>
                </div>

                {avail.notes && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Notes:</span> {avail.notes}
                  </p>
                )}

                {(currentUser?.role === "SuperAdmin" ||
                  currentUser?.role === "Admin" ||
                  currentUser?.id === avail.staff_id) && <UpdateAvailabilityDialog availability={avail} />}
              </div>
            ))}

            {filteredAvailability.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No availability records found</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
