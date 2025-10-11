"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MultiSelect, type MultiSelectOption } from "@/components/ui/multi-select"
import type { Service } from "@/lib/types"
import { X, Plus } from "lucide-react"

export function StaffServicesManager() {
  const [allServices, setAllServices] = useState<Service[]>([])
  const [myServices, setMyServices] = useState<Service[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, mine] = await Promise.all([fetch("/api/services?active=true"), fetch("/api/staff-services")])
      if (s.ok) setAllServices(await s.json())
      if (mine.ok) setMyServices(await mine.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const availableOptions: MultiSelectOption[] = useMemo(() => {
    const myIds = new Set(myServices.map((s) => String(s.id)))
    return allServices
      .filter((s) => !myIds.has(String(s.id)))
      .map((s) => ({
        value: String(s.id),
        label: `${s.name} • ₹${Number(s.price).toFixed(0)} (${s.duration}m)`,
      }))
  }, [allServices, myServices])

  const addSelected = async () => {
    if (selectedToAdd.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/staff-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_ids: selectedToAdd }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to add services")
      }
      setSelectedToAdd([])
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const removeService = async (serviceId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff-services?service_id=${encodeURIComponent(serviceId)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to remove service")
      }
      await fetchAll()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>My Skills (Services)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        <div className="space-y-2">
          <label className="text-sm font-medium">Add services I can perform</label>
          <MultiSelect
            options={availableOptions}
            value={selectedToAdd}
            onChange={setSelectedToAdd}
            placeholder="Select one or more services"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={addSelected} disabled={selectedToAdd.length === 0 || loading}>
              <Plus className="h-4 w-4 mr-2" /> Add Selected
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Current services</label>
          <div className="flex flex-wrap gap-2">
            {myServices.map((s) => (
              <Badge key={String(s.id)} variant="secondary" className="gap-2">
                {s.name}
                <button
                  type="button"
                  className="ml-1 inline-flex"
                  title="Remove"
                  onClick={() => removeService(String(s.id))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
            {myServices.length === 0 && <span className="text-sm text-muted-foreground">No services added yet</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
