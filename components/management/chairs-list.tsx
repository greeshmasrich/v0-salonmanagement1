"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Chair } from "@/lib/types"
import { UpdateChairDialog } from "./update-chair-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ChairsListProps {
  chairs: Chair[]
}

export function ChairsList({ chairs }: ChairsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Chairs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chair Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chairs.map((chair) => (
                <TableRow key={chair.id}>
                  <TableCell className="font-medium">{chair.chair_number}</TableCell>
                  <TableCell>{chair.description || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={chair.is_active ? "default" : "secondary"}>
                      {chair.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <UpdateChairDialog chair={chair} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {chairs.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No chairs found</p>}
        </div>
      </CardContent>
    </Card>
  )
}
