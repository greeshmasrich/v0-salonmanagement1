"use client"

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface AppointmentsChartClientProps {
  data: Array<{ status: string; count: number; fill: string }>
}

export function AppointmentsChartClient({ data }: AppointmentsChartClientProps) {
  return (
    <ChartContainer
      config={{
        count: {
          label: "Appointments",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
