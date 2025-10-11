import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { PopularServicesChart } from "@/components/dashboard/popular-services-chart"
import { RecentAppointments } from "@/components/dashboard/recent-appointments"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { getAuthUser } from "@/lib/db/auth"
import { StaffTodayServices } from "@/components/staff/today-services"
import { StaffServicesManager } from "@/components/staff/staff-services-manager"

export default async function DashboardPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>

        {user.role === "Staff" && (
          <div className="grid gap-6">
            <StaffTodayServices />
            <StaffServicesManager />
          </div>
        )}

        {user.role !== "Staff" && (
          <>
            <DashboardStats />
            <div className="grid gap-6 md:grid-cols-2">
              <RevenueChart />
              <AppointmentsChart />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <PopularServicesChart />
              <RecentAppointments />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
