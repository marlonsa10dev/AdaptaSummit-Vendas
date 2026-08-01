import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CalendarCheck,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getRegistros, concluirPendencia, reagendarPendencia } from '@/services/registros'
import { groupPendencias, getDatePart } from '@/lib/pendencia'
import { PendenciaItem } from '@/components/PendenciaItem'
import { RescheduleDialog } from '@/components/RescheduleDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Registro } from '@/types'

export default function MinhaSemana() {
  const { toast } = useToast()
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleTarget, setRescheduleTarget] = useState<Registro | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setRegistros(await getRegistros())
    } catch (err) {
      console.error('Erro:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('registros', () => {
    loadData()
  })

  const groups = groupPendencias(registros)
  const totalCount = groups.atrasadas.length + groups.hoje.length + groups.proximos7Dias.length

  const handleConcluir = async (id: string) => {
    try {
      await concluirPendencia(id)
      toast({ title: 'Pendência concluída!', description: 'Ação marcada como concluída.' })
      loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err?.message })
    }
  }

  const handleReagendar = async (newDate: string) => {
    if (!rescheduleTarget) return
    setRescheduling(true)
    try {
      await reagendarPendencia(rescheduleTarget.id, newDate)
      toast({ title: 'Pendência reagendada!', description: 'Nova data definida com sucesso.' })
      setRescheduleTarget(null)
      loadData()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err?.message })
    } finally {
      setRescheduling(false)
    }
  }

  const sections = [
    { title: 'Atrasadas', icon: AlertTriangle, items: groups.atrasadas, accent: 'text-rose-600' },
    { title: 'Para hoje', icon: CalendarCheck, items: groups.hoje, accent: 'text-amber-600' },
    {
      title: 'Próximos 7 dias',
      icon: CalendarRange,
      items: groups.proximos7Dias,
      accent: 'text-blue-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Minha Semana
        </h1>
        <p className="text-sm text-slate-500 mt-1">Suas pendências e ações da semana</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-rose-600">{groups.atrasadas.length}</p>
            <p className="text-[11px] font-medium text-slate-600">Atrasadas</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{groups.hoje.length}</p>
            <p className="text-[11px] font-medium text-slate-600">Para hoje</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{groups.concluidasSemana.length}</p>
            <p className="text-[11px] font-medium text-slate-600">Concluídas</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">Carregando pendências...</div>
      ) : totalCount === 0 && groups.concluidasSemana.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-800">Nenhuma pendência encontrada</p>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">
            Crie registros com próxima ação para acompanhar suas pendências.
          </p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
            <Link to="/registros">Ir para registros</Link>
          </Button>
        </div>
      ) : (
        <>
          {sections.map((section) => {
            if (section.items.length === 0) return null
            const Icon = section.icon
            return (
              <div key={section.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${section.accent}`} />
                  <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
                  <span className="text-xs text-slate-400">({section.items.length})</span>
                </div>
                <div className="space-y-2">
                  {section.items.map((r) => (
                    <PendenciaItem
                      key={r.id}
                      registro={r}
                      onConcluir={handleConcluir}
                      onReagendar={setRescheduleTarget}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {groups.concluidasSemana.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Concluídas na semana</h3>
                <span className="text-xs text-slate-400">({groups.concluidasSemana.length})</span>
              </div>
              <div className="space-y-2">
                {groups.concluidasSemana.map((r) => (
                  <PendenciaItem
                    key={r.id}
                    registro={r}
                    onConcluir={handleConcluir}
                    onReagendar={setRescheduleTarget}
                    isConcluida
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <RescheduleDialog
        open={!!rescheduleTarget}
        onOpenChange={(open) => !open && setRescheduleTarget(null)}
        currentDate={getDatePart(rescheduleTarget?.dataProximaAcao || '')}
        onConfirm={handleReagendar}
        loading={rescheduling}
      />
    </div>
  )
}
