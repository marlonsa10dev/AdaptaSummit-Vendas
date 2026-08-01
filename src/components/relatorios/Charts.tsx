import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatBR } from '@/lib/date-utils'

const chartConfig = {
  count: { label: 'Registros', color: 'hsl(221, 83%, 53%)' },
} satisfies ChartConfig

interface VolumeChartProps {
  data: { tipo: string; count: number }[]
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="tipo" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

interface TrendChartProps {
  data: { week: string; count: number }[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[220px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10 }}
          tickFormatter={(v: string) => formatBR(v)}
        />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey="count" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ChartContainer>
  )
}
