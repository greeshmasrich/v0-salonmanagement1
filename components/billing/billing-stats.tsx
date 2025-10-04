import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Clock, TrendingUp } from "lucide-react"

export async function BillingStats() {
  // Fetch stats from billing API
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/billing/stats`, {
    cache: "no-store",
  })
  const {
    todayTotal = 0,
    pendingTotal = 0,
    pendingCount = 0,
    monthlyTotal = 0,
    totalTransactions = 0,
  } = await res.json()

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${Number(todayTotal).toFixed(2)}`,
      icon: DollarSign,
      description: "Collected today",
    },
    {
      title: "Pending Payments",
      value: `₹${Number(pendingTotal).toFixed(2)}`,
      icon: Clock,
      description: `${pendingCount} pending bills`,
    },
    {
      title: "Monthly Revenue",
      value: `₹${Number(monthlyTotal).toFixed(2)}`,
      icon: TrendingUp,
      description: "This month",
    },
    {
      title: "Total Transactions",
      value: totalTransactions || 0,
      icon: CreditCard,
      description: "All time",
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
