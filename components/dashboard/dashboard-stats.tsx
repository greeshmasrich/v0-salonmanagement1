import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, DollarSign, Users, TrendingUp } from "lucide-react"
import { query } from "@/lib/db/mysql"

export async function DashboardStats() {
  // Get today's date
  const today = new Date().toISOString().split("T")[0]

  // Fetch statistics
  const todayAppointmentsResult = await query("SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?", [
    today,
  ])
  const todayAppointments = todayAppointmentsResult[0]?.count || 0

  const totalCustomersResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'User'")
  const totalCustomers = totalCustomersResult[0]?.count || 0

  const monthlyRevenueResult = await query(
    "SELECT SUM(final_amount) as total FROM billing WHERE payment_status = 'Paid' AND created_at >= ?",
    [new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()],
  )
  const totalRevenue = Number(monthlyRevenueResult[0]?.total || 0)

  const lastMonthRevenueResult = await query(
    "SELECT SUM(final_amount) as total FROM billing WHERE payment_status = 'Paid' AND created_at >= ? AND created_at < ?",
    [
      new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(),
      new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    ],
  )
  const lastMonthTotal = Number(lastMonthRevenueResult[0]?.total || 0)
  const revenueGrowth = lastMonthTotal > 0 ? ((totalRevenue - lastMonthTotal) / lastMonthTotal) * 100 : 0

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      description: "Scheduled for today",
    },
    {
      title: "Total Customers",
      value: totalCustomers,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Monthly Revenue",
      value: `₹${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "This month",
    },
    {
      title: "Revenue Growth",
      value: `${revenueGrowth > 0 ? "+" : ""}${revenueGrowth.toFixed(1)}%`,
      icon: TrendingUp,
      description: "vs last month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
