import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ServicesList } from "@/components/management/services-list"
import { CreateServiceDialog } from "@/components/management/create-service-dialog"
import { getAuthUser } from "@/lib/db/auth"
import { query } from "@/lib/db/mysql"

export default async function ServicesManagementPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Only SuperAdmin and Admin can access
  if (user?.role !== "SuperAdmin" && user?.role !== "Admin") {
    redirect("/dashboard")
  }

  const services = await query("SELECT * FROM services ORDER BY name ASC")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Services Management</h1>
          <CreateServiceDialog />
        </div>

        <ServicesList services={services || []} />
      </main>
    </div>
  )
}
