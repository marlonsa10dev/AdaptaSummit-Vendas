import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface RescheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDate: string
  onConfirm: (newDate: string) => void
  loading?: boolean
}

export function RescheduleDialog({
  open,
  onOpenChange,
  currentDate,
  onConfirm,
  loading,
}: RescheduleDialogProps) {
  const [newDate, setNewDate] = useState(currentDate)

  useEffect(() => {
    if (open) setNewDate(currentDate)
  }, [currentDate, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Reagendar pendência
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="reschedule-date" className="text-xs font-semibold text-slate-700">
            Nova data prevista
          </Label>
          <Input
            id="reschedule-date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="bg-slate-50/50 focus:bg-white"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-xs">
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(newDate)}
            disabled={loading || !newDate}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
          >
            {loading ? 'Salvando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
