import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppointmentsChartClient } from "./appointments-chart-client"
import { query } from "@/lib/db/mysql"

export async function AppointmentsChart() {
  const appointments = await query("SELECT status FROM appointments")

  const statusCounts = appointments.reduce((acc: Record<string, number>, apt: any) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1
    return acc
  }, {})

  const chartData = [
    { status: "Pending", count: statusCounts.Pending || 0, fill: "hsl(var(--chart-1))" },
    { status: "Confirmed", count: statusCounts.Confirmed || 0, fill: "hsl(var(--chart-2))" },
    { status: "Completed", count: statusCounts.Completed || 0, fill: "hsl(var(--chart-3))" },
    { status: "Cancelled", count: statusCounts.Cancelled || 0, fill: "hsl(var(--chart-4))" },
    { status: "No-Show", count: statusCounts["No-Show"] || 0, fill: "hsl(var(--chart-5))" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointments Status</CardTitle>
        <CardDescription>Distribution of appointment statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <AppointmentsChartClient data={chartData} />
      </CardContent>
    </Card>
  )
}
