import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PeriodFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

function fmt(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function PeriodFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: PeriodFilterProps) {
  const setPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onStartDateChange(fmt(start))
    onEndDateChange(fmt(end))
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Data inicial</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="h-9 w-40 text-xs bg-slate-50/50"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-slate-700">Data final</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="h-9 w-40 text-xs bg-slate-50/50"
        />
      </div>
      <Button variant="outline" size="sm" onClick={() => setPreset(7)} className="text-xs h-9">
        7 dias
      </Button>
      <Button variant="outline" size="sm" onClick={() => setPreset(30)} className="text-xs h-9">
        30 dias
      </Button>
      <Button variant="outline" size="sm" onClick={() => setPreset(90)} className="text-xs h-9">
        90 dias
      </Button>
    </div>
  )
}
