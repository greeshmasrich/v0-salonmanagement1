export type UserRole = "SuperAdmin" | "Admin" | "Staff" | "User"
export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-Show"
export type PaymentStatus = "Pending" | "Paid" | "Refunded" | "Failed"
export type PaymentMethod = "Cash" | "Card" | "UPI" | "Wallet"

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Chair {
  id: string
  chair_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffAvailability {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  customer_id: string
  staff_id: string
  service_id: string
  chair_id?: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
  customer?: User
  staff?: User
  service?: Service
  chair?: Chair
}

export interface Billing {
  id: string
  appointment_id: string
  customer_id: string
  total_amount: number
  discount_amount: number
  final_amount: number
  payment_status: PaymentStatus
  payment_method?: PaymentMethod
  payment_date?: string
  notes?: string
  created_at: string
  updated_at: string
  appointment?: Appointment
  customer?: User
}
