import { useEffect, useState, useMemo } from 'react'
import { Download, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getRelatorioData, type RelatorioData } from '@/services/relatorios'
import {
  filterByPeriod,
  getTipoCounts,
  getCompletionRate,
  getOverduePendencias,
  getPortfolioCoverage,
} from '@/lib/relatorios'
import { exportToCSV } from '@/lib/export'
import { PeriodFilter } from '@/components/relatorios/PeriodFilter'
import { PendenciaItem } from '@/components/PendenciaItem'
import { RescheduleDialog } from '@/components/RescheduleDialog'
import { concluirPendencia, reagendarPendencia } from '@/services/registros'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { getDatePart } from '@/lib/pendencia'
import { formatBR } from '@/lib/date-utils'
import type { Registro } from '@/types'

export default function VisaoVendedor() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSeller, setSelectedSeller] = useState('')
  const [rescheduleTarget, setRescheduleTarget] = useState<Registro | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  const isManager =
    user?.perfil === 'Gestor' || user?.perfil === 'Diretoria' || user?.perfil === 'Administrador'

  useEffect(() => {
    getRelatorioData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user && !selectedSeller) setSelectedSeller(user.id)
  }, [user, selectedSeller])

  const sellerRegistros = useMemo(() => {
    if (!data) return []
    let regs = data.registros.filter((r) => r.responsavel === selectedSeller)
    if (startDate || endDate) regs = filterByPeriod(regs, startDate, endDate)
    return regs
  }, [data, selectedSeller, startDate, endDate])

  const counts = getTipoCounts(sellerRegistros)
  const completionRate = getCompletionRate(sellerRegistros)
  const coverage = data ? getPortfolioCoverage(sellerRegistros, data.clientes, selectedSeller) : 0
  const overdue = getOverduePendencias(
    data?.registros.filter((r) => r.responsavel === selectedSeller) || [],
  )

  const handleExport = () => {
    exportToCSV(
      `visao-vendedor-${selectedSeller}`,
      [
        { key: 'data', label: 'Data' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'cliente', label: 'Cliente' },
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'proximaAcao', label: 'Próxima Ação' },
        { key: 'status', label: 'Status' },
      ],
      sellerRegistros.map((r) => ({
        data: formatBR(r.data),
        tipo: r.tipo,
        cliente: r.expand?.cliente?.nome || '',
        vendedor: r.expand?.cliente?.expand?.vendedor?.name || 'Não atribuído',
        descricao: r.descricao,
        proximaAcao: r.proximaAcao || '',
        status: r.status || '',
      })),
    )
  }

  const handleConcluir = async (id: string) => {
    try {
      await concluirPendencia(id)
      toast({ title: 'Pendência concluída!' })
      setData((prev) =>
        prev
          ? {
              ...prev,
              registros: prev.registros.map((r) =>
                r.id === id ? { ...r, status: 'Concluída' as const } : r,
              ),
            }
          : prev,
      )
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err?.message })
    }
  }

  const handleReagendar = async (newDate: string) => {
    if (!rescheduleTarget) return
    setRescheduling(true)
    try {
      await reagendarPendencia(rescheduleTarget.id, newDate)
      toast({ title: 'Pendência reagendada!' })
      setRescheduleTarget(null)
      setData((prev) =>
        prev
          ? {
              ...prev,
              registros: prev.registros.map((r) =>
                r.id === rescheduleTarget.id ? { ...r, dataProximaAcao: newDate } : r,
              ),
            }
          : prev,
      )
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err?.message })
    } finally {
      setRescheduling(false)
    }
  }

  if (loading)
    return <div className="py-12 text-center text-sm text-slate-500">Carregando dados...</div>

  const metrics = [
    { label: 'Total registros', value: sellerRegistros.length, color: 'text-slate-900' },
    { label: 'Highlights', value: counts.Highlight, color: 'text-emerald-600' },
    { label: 'Lowlights', value: counts.Lowlight, color: 'text-rose-600' },
    { label: 'Ações', value: counts['Ação para semana seguinte'], color: 'text-blue-600' },
    { label: 'Taxa conclusão', value: `${completionRate}%`, color: 'text-purple-600' },
    { label: 'Cobertura carteira', value: `${coverage}%`, color: 'text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Visão por Vendedor
          </h1>
          <p className="text-sm text-slate-500 mt-1">Performance individual e indicadores</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-4 space-y-4">
          {isManager && data && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Vendedor</Label>
              <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                <SelectTrigger className="w-full md:w-80 h-9 text-xs bg-slate-50/50">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {data.users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.perfil})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <PeriodFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-slate-200 shadow-sm">
            <CardContent className="p-3 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[11px] font-medium text-slate-600 mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {overdue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Pendências atrasadas ({overdue.length})
            </h3>
          </div>
          <div className="space-y-2">
            {overdue.map((r) => (
              <PendenciaItem
                key={r.id}
                registro={r}
                onConcluir={handleConcluir}
                onReagendar={setRescheduleTarget}
              />
            ))}
          </div>
        </div>
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
