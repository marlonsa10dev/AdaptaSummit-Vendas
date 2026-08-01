import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, CalendarClock, Download, Search } from 'lucide-react'
import { getRelatorioData, type RelatorioData } from '@/services/relatorios'
import { getDatePart, hasPendencia, getPendenciaStatus } from '@/lib/pendencia'
import { exportToCSV } from '@/lib/export'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const tipoMeta: Record<string, { icon: typeof TrendingUp; color: string; bg: string }> = {
  Highlight: {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  Lowlight: { icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
  'Ação para semana seguinte': {
    icon: CalendarClock,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
  },
}

export default function FichaCliente() {
  const { clienteId } = useParams<{ clienteId: string }>()
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')

  useEffect(() => {
    getRelatorioData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cliente = data?.clientes.find((c) => c.id === clienteId)

  const registros = useMemo(() => {
    if (!data) return []
    return data.registros
      .filter((r) => r.cliente === clienteId)
      .filter((r) => !tipoFilter || r.tipo === tipoFilter)
      .filter((r) => !search || r.descricao.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => getDatePart(a.data).localeCompare(getDatePart(b.data)))
  }, [data, clienteId, tipoFilter, search])

  const handleExport = () => {
    exportToCSV(
      `ficha-${cliente?.nome || 'cliente'}`,
      [
        { key: 'data', label: 'Data' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'descricao', label: 'Descrição' },
        { key: 'responsavel', label: 'Responsável' },
        { key: 'proximaAcao', label: 'Próxima Ação' },
        { key: 'status', label: 'Status' },
      ],
      registros.map((r) => ({
        data: getDatePart(r.data),
        tipo: r.tipo,
        descricao: r.descricao,
        responsavel: r.expand?.responsavel?.name || '',
        proximaAcao: r.proximaAcao || '',
        status: hasPendencia(r) ? getPendenciaStatus(r) : '',
      })),
    )
  }

  if (loading)
    return (
      <div className="py-12 text-center text-sm text-slate-500">Carregando ficha do cliente...</div>
    )
  if (!cliente)
    return <div className="py-12 text-center text-sm text-slate-500">Cliente não encontrado.</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1 text-slate-500">
            <Link to="/clientes">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {cliente.nome}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ficha da Conta · {registros.length} registros
            </p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Filtros</CardTitle>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar na descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50/50"
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[200px] h-9 text-xs bg-slate-50/50">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Highlight">Highlight</SelectItem>
                <SelectItem value="Lowlight">Lowlight</SelectItem>
                <SelectItem value="Ação para semana seguinte">Ação para semana seguinte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {registros.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {registros.map((r) => {
                const meta = tipoMeta[r.tipo] || tipoMeta['Highlight']
                const Icon = meta.icon
                const pStatus = hasPendencia(r) ? getPendenciaStatus(r) : null
                const isOverdue = pStatus === 'Atrasada'
                return (
                  <div
                    key={r.id}
                    className={cn(
                      'flex gap-3 rounded-lg border p-3',
                      meta.bg,
                      isOverdue && 'ring-2 ring-rose-300',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white',
                        meta.color,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">{r.tipo}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(getDatePart(r.data) + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{r.descricao}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>Responsável: {r.expand?.responsavel?.name || 'N/A'}</span>
                        {pStatus && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-1.5 py-0',
                              pStatus === 'Concluída'
                                ? 'text-emerald-600 border-emerald-200'
                                : isOverdue
                                  ? 'text-rose-600 border-rose-200'
                                  : 'text-amber-600 border-amber-200',
                            )}
                          >
                            {pStatus}
                          </Badge>
                        )}
                      </div>
                      {r.proximaAcao && (
                        <p className="text-xs text-slate-500 mt-1 bg-white/60 rounded px-2 py-1">
                          → {r.proximaAcao}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
