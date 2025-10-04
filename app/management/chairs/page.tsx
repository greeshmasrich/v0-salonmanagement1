import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ChairsList } from "@/components/management/chairs-list"
import { CreateChairDialog } from "@/components/management/create-chair-dialog"
import { getAuthUser } from "@/lib/db/auth"
import { query } from "@/lib/db/mysql"

export default async function ChairsManagementPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Only SuperAdmin and Admin can access
  if (user?.role !== "SuperAdmin" && user?.role !== "Admin") {
    redirect("/dashboard")
  }

  const chairs = await query("SELECT * FROM chairs ORDER BY chair_number ASC")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Chairs Management</h1>
          <CreateChairDialog />
        </div>

        <ChairsList chairs={chairs || []} />
      </main>
    </div>
  )
}
