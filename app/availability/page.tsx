import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AvailabilityCalendar } from "@/components/availability/availability-calendar"
import { AvailabilityList } from "@/components/availability/availability-list"
import { CreateAvailabilityDialog } from "@/components/availability/create-availability-dialog"
import { getAuthUser } from "@/lib/db/auth"

export default async function AvailabilityPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Only Staff, Admin, and SuperAdmin can access
  if (user?.role === "User") {
    redirect("/dashboard")
  }

  // Fetch availability records from API
  let availability = []
  if (user?.role === "Staff") {
    // Staff members only see their own availability
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/availability?staff_id=${user.id}`, {
      cache: "no-store",
    })
    availability = await res.json()
  } else {
    // Admin and SuperAdmin see all availability
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/availability`, {
      cache: "no-store",
    })
    availability = await res.json()
  }

  // Fetch all staff members for admin/superadmin from API
  let staffMembers = []
  if (user?.role === "Admin" || user?.role === "SuperAdmin") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/staff`, {
      cache: "no-store",
    })
    staffMembers = await res.json()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Staff Availability</h1>
          <CreateAvailabilityDialog currentUser={user} staffMembers={staffMembers} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AvailabilityCalendar availability={availability || []} />
          </div>
          <div>
            <AvailabilityList availability={availability || []} currentUser={user} />
          </div>
        </div>
      </main>
    </div>
  )
}
