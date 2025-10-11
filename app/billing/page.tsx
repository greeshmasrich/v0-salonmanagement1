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

  const base = process.env.NEXT_PUBLIC_BASE_URL || ""
  const [billingRes, unbilledRes] = await Promise.all([
    fetch(`${base}/api/billing`, { headers: { cookie: "" }, cache: "no-store" }),
    fetch(`${base}/api/billing/unbilled-appointments`, { headers: { cookie: "" }, cache: "no-store" }),
  ])
  const billingRecords = billingRes.ok ? await billingRes.json() : []
  const unbilledAppointments = unbilledRes.ok ? await unbilledRes.json() : []

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
          {(user?.role === "SuperAdmin" || user?.role === "Admin" || user?.role === "Staff") && (
            <CreateBillDialog unbilledAppointments={unbilledAppointments || []} />
          )}
        </div>

        <BillingStats />

        <BillingList billingRecords={billingRecords || []} currentUser={user} />
      </main>
    </div>
  )
}
