import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { CreateAppointmentDialog } from "@/components/appointments/create-appointment-dialog"
import { getAuthUser } from "@/lib/db/auth"
import { query } from "@/lib/db/mysql"

export default async function AppointmentsPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch all appointments with joins
  const appointments = await query(`
    SELECT 
      a.*,
      c.id as customer_id, c.full_name as customer_name, c.email as customer_email, c.phone as customer_phone,
      st.id as staff_id, st.full_name as staff_name,
      s.id as service_id, s.name as service_name, s.duration as service_duration, s.price as service_price,
      ch.id as chair_id, ch.chair_number
    FROM appointments a
    LEFT JOIN users c ON a.customer_id = c.id
    LEFT JOIN users st ON a.staff_id = st.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN chairs ch ON a.chair_id = ch.id
    ORDER BY a.appointment_date ASC, a.start_time ASC
  `)

  // Fetch services for the create dialog
  const services = await query("SELECT * FROM services WHERE is_active = 1")

  // Fetch staff members
  const staff = await query("SELECT * FROM users WHERE role IN ('Staff', 'Admin', 'SuperAdmin')")

  // Fetch chairs
  const chairs = await query("SELECT * FROM chairs WHERE is_active = 1")

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <CreateAppointmentDialog
            services={services || []}
            staff={staff || []}
            chairs={chairs || []}
            currentUser={user}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AppointmentCalendar appointments={appointments || []} />
          </div>
          <div>
            <AppointmentList appointments={appointments || []} currentUser={user} />
          </div>
        </div>
      </main>
    </div>
  )
}
