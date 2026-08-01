import { Check, CalendarClock, CalendarDays } from 'lucide-react'
import type { Registro } from '@/types'
import { getPendenciaStatus, getDatePart } from '@/lib/pendencia'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PendenciaItemProps {
  registro: Registro
  onConcluir: (id: string) => void
  onReagendar: (registro: Registro) => void
  isConcluida?: boolean
}

export function PendenciaItem({
  registro,
  onConcluir,
  onReagendar,
  isConcluida,
}: PendenciaItemProps) {
  const status = getPendenciaStatus(registro)
  const dataPrevista = getDatePart(registro.dataProximaAcao || '')
  const isOverdue = !isConcluida && status === 'Atrasada'

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3 transition-colors',
        isConcluida
          ? 'border-emerald-200 bg-emerald-50/50'
          : isOverdue
            ? 'border-rose-200 bg-rose-50/50'
            : 'border-slate-200 bg-white',
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg',
          isConcluida
            ? 'bg-emerald-100 text-emerald-600'
            : isOverdue
              ? 'bg-rose-100 text-rose-600'
              : 'bg-blue-100 text-blue-600',
        )}
      >
        {isConcluida ? <Check className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-900 truncate">
            {registro.expand?.cliente?.nome || 'Cliente'}
          </span>
          <span
            className={cn(
              'text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
              isConcluida
                ? 'bg-emerald-100 text-emerald-700'
                : isOverdue
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700',
            )}
          >
            {isConcluida ? 'Concluída' : isOverdue ? 'Atrasada' : 'Pendente'}
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-1.5">{registro.proximaAcao}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <CalendarDays className="h-3 w-3" />
          <span>Prevista: {new Date(dataPrevista + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
      {!isConcluida && (
        <div className="flex flex-col gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConcluir(registro.id)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Check className="h-3 w-3" /> Concluir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReagendar(registro)}
            className="h-7 px-2 text-xs text-slate-500 gap-1"
          >
            <CalendarClock className="h-3 w-3" /> Reagendar
          </Button>
        </div>
      )}
    </div>
  )
}
