"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import type { Billing, User } from "@/lib/types"
import { UpdateBillDialog } from "./update-bill-dialog"
import { Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BillingListProps {
  billingRecords: Billing[]
  currentUser: User | null
}

export function BillingList({ billingRecords, currentUser }: BillingListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all")

  const filteredRecords = billingRecords.filter((record) => {
    const matchesSearch =
      (record.customer as any)?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.customer as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === "all" || record.payment_status === (filter === "paid" ? "Paid" : "Pending")

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "Pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "Refunded":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "Failed":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const canManageBilling =
    currentUser?.role === "SuperAdmin" || currentUser?.role === "Admin" || currentUser?.role === "Staff"

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Billing Records</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[250px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
                All
              </Button>
              <Button variant={filter === "paid" ? "default" : "outline"} size="sm" onClick={() => setFilter("paid")}>
                Paid
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("pending")}
              >
                Pending
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                {canManageBilling && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{(record.customer as any)?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{(record.customer as any)?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{(record.appointment as any)?.service?.name}</TableCell>
                  <TableCell>
                    {record.payment_date
                      ? format(new Date(record.payment_date), "MMM dd, yyyy")
                      : format(new Date(record.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">₹{Number(record.final_amount).toFixed(2)}</p>
                      {record.discount_amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Discount: ₹{Number(record.discount_amount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.payment_method || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.payment_status)}>{record.payment_status}</Badge>
                  </TableCell>
                  {canManageBilling && (
                    <TableCell>
                      <UpdateBillDialog billing={record} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredRecords.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">No billing records found</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
