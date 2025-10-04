import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { query } from "@/lib/db/mysql"

export async function RecentAppointments() {
  const appointments = await query(`
    SELECT 
      a.*,
      c.full_name as customer_name,
      s.name as service_name,
      st.full_name as staff_name
    FROM appointments a
    LEFT JOIN users c ON a.customer_id = c.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users st ON a.staff_id = st.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "Completed":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "Cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
        <CardDescription>Latest appointment bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments?.map((appointment: any) => (
            <div
              key={appointment.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{appointment.customer_name}</p>
                <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(appointment.appointment_date), "MMM dd, yyyy")} at {appointment.start_time}
                </p>
              </div>
              <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
            </div>
          ))}
          {!appointments || appointments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No appointments yet</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
