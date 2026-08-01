import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search,
  Pencil,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  ClipboardList,
  Check,
} from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getRegistros,
  deleteRegistro,
  concluirPendencia,
  reagendarPendencia,
} from '@/services/registros'
import { getPendenciaStatus, hasPendencia } from '@/lib/pendencia'
import { formatBR } from '@/lib/date-utils'
import { DateInput } from '@/components/DateInput'
import { RescheduleDialog } from '@/components/RescheduleDialog'
import { getClientes } from '@/services/clientes'
import { RegistroForm } from '@/components/RegistroForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import type { Cliente, Registro } from '@/types'

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function getDatePart(dateStr: string): string {
  return dateStr?.split(' ')[0]?.split('T')[0] || ''
}

const tipoMeta: Record<string, { icon: typeof TrendingUp; badge: string; border: string }> = {
  Highlight: {
    icon: TrendingUp,
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    border: 'border-l-emerald-400',
  },
  Lowlight: {
    icon: TrendingDown,
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    border: 'border-l-rose-400',
  },
  'Ação para semana seguinte': {
    icon: CalendarClock,
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    border: 'border-l-blue-400',
  },
}

export default function Registros() {
  const { toast } = useToast()

  const [registros, setRegistros] = useState<Registro[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRegistro, setEditingRegistro] = useState<Registro | null>(null)
  const [deletingRegistro, setDeletingRegistro] = useState<Registro | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState<Registro | null>(null)
  const [rescheduling, setRescheduling] = useState(false)

  const [clienteFilter, setClienteFilter] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [registrosData, clientesData] = await Promise.all([getRegistros(), getClientes()])
      setRegistros(registrosData)
      setClientes(clientesData)
    } catch (err) {
      console.error('Erro ao carregar registros:', err)
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

  const filteredRegistros = useMemo(() => {
    return registros.filter((r) => {
      if (clienteFilter) {
        const nome = r.expand?.cliente?.nome || ''
        if (!normalizeName(nome).includes(normalizeName(clienteFilter))) return false
      }
      if (tipoFilter && r.tipo !== tipoFilter) return false
      const rDate = getDatePart(r.data)
      if (dataInicial && rDate < dataInicial) return false
      if (dataFinal && rDate > dataFinal) return false
      return true
    })
  }, [registros, clienteFilter, tipoFilter, dataInicial, dataFinal])

  const handleEdit = (registro: Registro) => {
    setEditingRegistro(registro)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteConfirm = async () => {
    if (!deletingRegistro) return
    setDeleting(true)
    try {
      await deleteRegistro(deletingRegistro.id)
      toast({ title: 'Registro excluído', description: 'Registro removido com sucesso.' })
      setDeletingRegistro(null)
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.message || 'Erro ao excluir.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleConcluir = async (id: string) => {
    try {
      await concluirPendencia(id)
      toast({ title: 'Pendência concluída', description: 'Ação marcada como concluída.' })
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.message || 'Erro ao concluir.',
      })
    }
  }

  const handleReagendar = async (newDate: string) => {
    if (!rescheduleTarget) return
    setRescheduling(true)
    try {
      await reagendarPendencia(rescheduleTarget.id, newDate)
      toast({ title: 'Pendência reagendada', description: 'Nova data definida com sucesso.' })
      setRescheduleTarget(null)
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err?.message || 'Erro ao reagendar.',
      })
    } finally {
      setRescheduling(false)
    }
  }

  const handleClientCreated = (cliente: Cliente) => setClientes((prev) => [...prev, cliente])
  const hasFilters = clienteFilter || tipoFilter || dataInicial || dataFinal
  const clearFilters = () => {
    setClienteFilter('')
    setTipoFilter('')
    setDataInicial('')
    setDataFinal('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Registros
          </h1>
          <p className="text-sm text-slate-500 mt-1">Highlights, Lowlights e Ações por cliente</p>
        </div>
      </div>

      <RegistroForm
        editingRegistro={editingRegistro}
        clientes={clientes}
        onSaved={() => {
          setEditingRegistro(null)
          loadData()
        }}
        onCancelEdit={() => setEditingRegistro(null)}
        onClientCreated={handleClientCreated}
      />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-900">Filtros</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente..."
                value={clienteFilter}
                onChange={(e) => setClienteFilter(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="h-9 text-xs bg-slate-50/50">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Highlight">Highlight</SelectItem>
                <SelectItem value="Lowlight">Lowlight</SelectItem>
                <SelectItem value="Ação para semana seguinte">Ação para semana seguinte</SelectItem>
              </SelectContent>
            </Select>
            <DateInput
              value={dataInicial}
              onChange={(v) => setDataInicial(v)}
              placeholder="dd/mm/aaaa"
              className="h-9 text-xs bg-slate-50/50"
            />
            <DateInput
              value={dataFinal}
              onChange={(v) => setDataFinal(v)}
              placeholder="dd/mm/aaaa"
              className="h-9 text-xs bg-slate-50/50"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-slate-500 mt-2 gap-1 w-fit"
            >
              <X className="h-3 w-3" /> Limpar filtros
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Carregando registros...</div>
          ) : filteredRegistros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center p-4">
              <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-800">Nenhum registro encontrado</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasFilters ? 'Tente ajustar os filtros' : 'Crie seu primeiro registro acima.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRegistros.map((registro) => {
                const meta = tipoMeta[registro.tipo] || tipoMeta['Highlight']
                const Icon = meta.icon
                const pStatus = hasPendencia(registro) ? getPendenciaStatus(registro) : null
                return (
                  <div
                    key={registro.id}
                    className={`p-4 border-l-4 ${meta.border} hover:bg-slate-50/50 transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.badge}`}
                        >
                          <Icon className="h-3 w-3" />
                          {registro.tipo}
                        </span>
                        {pStatus && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${pStatus === 'Concluída' ? 'text-emerald-600 border-emerald-200' : pStatus === 'Atrasada' ? 'text-rose-600 border-rose-200' : 'text-amber-600 border-amber-200'}`}
                          >
                            {pStatus}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {formatBR(registro.data)}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-1">
                      {registro.expand?.cliente?.nome || 'Cliente não informado'}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">{registro.descricao}</p>
                    {registro.proximaAcao && (
                      <div className="flex items-start gap-2 mb-2 bg-slate-50 rounded-md p-2">
                        <CalendarClock className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-slate-700">{registro.proximaAcao}</p>
                          {registro.dataProximaAcao && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Previsão: {formatBR(registro.dataProximaAcao || '')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap justify-end gap-2">
                      {pStatus && pStatus !== 'Concluída' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConcluir(registro.id)}
                            className="h-7 px-2 text-xs text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                          >
                            <Check className="h-3 w-3 mr-1" /> Concluir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRescheduleTarget(registro)}
                            className="h-7 px-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <CalendarClock className="h-3 w-3 mr-1" /> Reagendar
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(registro)}
                        className="h-7 px-2 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingRegistro(registro)}
                        className="h-7 px-2 text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingRegistro}
        onOpenChange={(open) => !open && setDeletingRegistro(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Excluir registro
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Deseja realmente excluir este registro? Esta ação não pode ser desfeita.
              {deletingRegistro &&
                hasPendencia(deletingRegistro) &&
                getPendenciaStatus(deletingRegistro) !== 'Concluída' && (
                  <span className="block mt-2 text-rose-600 font-medium">
                    ⚠️ Este registro possui uma pendência não concluída. Excluí-lo removerá a
                    pendência permanentemente.
                  </span>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
