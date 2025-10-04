import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PopularServicesChartClient } from "./popular-services-chart-client"
import { query } from "@/lib/db/mysql"

export async function PopularServicesChart() {
  const appointments = await query(`
    SELECT s.name 
    FROM appointments a
    JOIN services s ON a.service_id = s.id
  `)

  const serviceCounts = appointments.reduce((acc: Record<string, number>, apt: any) => {
    const serviceName = apt.name || "Unknown"
    acc[serviceName] = (acc[serviceName] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Popular Services</CardTitle>
        <CardDescription>Top 5 most booked services</CardDescription>
      </CardHeader>
      <CardContent>
        <PopularServicesChartClient data={chartData} />
      </CardContent>
    </Card>
  )
}
