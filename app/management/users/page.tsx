import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { UsersList } from "@/components/management/users-list"
import { CreateUserDialog } from "@/components/management/create-user-dialog"
import { getAuthUser } from "@/lib/db/auth"
import { query } from "@/lib/db/mysql"

export default async function UsersManagementPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Only SuperAdmin and Admin can access
  if (user?.role !== "SuperAdmin" && user?.role !== "Admin") {
    redirect("/dashboard")
  }

  const users = await query("SELECT * FROM users ORDER BY created_at DESC")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <CreateUserDialog />
        </div>

        <UsersList users={users || []} currentUser={user} />
      </main>
    </div>
  )
}
