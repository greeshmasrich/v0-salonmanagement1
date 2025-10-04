import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BillingList } from "@/components/billing/billing-list"
import { BillingStats } from "@/components/billing/billing-stats"
import { CreateBillDialog } from "@/components/billing/create-bill-dialog"
import { getAuthUser } from "@/lib/db/auth"

export default async function BillingPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch billing records from API
  const billingRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/billing`, {
    headers: { cookie: "" }, // pass cookies if needed for auth
    cache: "no-store",
  })
  const billingRecords = await billingRes.json()

  // Fetch unbilled appointments from API
  const unbilledRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/appointments/unbilled`, {
    headers: { cookie: "" },
    cache: "no-store",
  })
  const unbilledAppointments = await unbilledRes.json()

  return (
    <div className="flex min-h-screen flex-col">
      {/* <DashboardHeader user={user} /> */}
      {/* <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          {(user?.role === "SuperAdmin" || user?.role === "Admin" || user?.role === "Staff") && (
            <CreateBillDialog unbilledAppointments={unbilledAppointments || []} />
          )}
        </div>

        <BillingStats />

        <BillingList billingRecords={billingRecords || []} currentUser={user} />
      </main> */}
    </div>
  )
}
