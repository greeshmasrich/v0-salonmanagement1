import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChartClient } from "./revenue-chart-client"
import { query } from "@/lib/db/mysql"

export async function RevenueChart() {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  const revenueData = await Promise.all(
    last7Days.map(async (date) => {
      const result = await query(
        "SELECT SUM(final_amount) as total FROM billing WHERE payment_status = 'Paid' AND DATE(created_at) = ?",
        [date],
      )

      const total = result[0]?.total || 0

      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: Number(total),
      }
    }),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Daily revenue for the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <RevenueChartClient data={revenueData} />
      </CardContent>
    </Card>
  )
}
