import { useEffect, useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import { formatBR, maskBR, parseBR, isValidDate } from '@/lib/date-utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
  placeholder?: string
  className?: string
  id?: string
}

export function DateInput({
  value,
  onChange,
  min,
  max,
  placeholder,
  className,
  id,
}: DateInputProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value ? formatBR(value) : '')

  useEffect(() => {
    setText(value ? formatBR(value) : '')
  }, [value])

  const handleTextChange = (input: string) => {
    const masked = maskBR(input)
    setText(masked)
    const parsed = parseBR(masked)
    if (parsed && isValidDate(parsed)) {
      if (min && parsed < min) return
      if (max && parsed > max) return
      onChange(parsed)
    } else if (masked.length === 0) {
      onChange('')
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const isoDate = `${y}-${m}-${d}`
      onChange(isoDate)
      setText(`${d}/${m}/${y}`)
    }
    setOpen(false)
  }

  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined

  const disabledDates = (date: Date) => {
    if (min && date < new Date(min + 'T00:00:00')) return true
    if (max && date > new Date(max + 'T00:00:00')) return true
    return false
  }

  return (
    <div className="relative flex items-center">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder || 'dd/mm/aaaa'}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className={cn('pr-9', className)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-2.5 hover:bg-transparent"
          >
            <CalendarIcon className="h-4 w-4 text-slate-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={disabledDates}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
