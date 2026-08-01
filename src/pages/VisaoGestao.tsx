import { useEffect, useState, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getRelatorioData, type RelatorioData } from '@/services/relatorios'
import {
  filterByPeriod,
  getTipoCounts,
  getLowlightRanking,
  getWeeklyTrend,
  getSellerStats,
} from '@/lib/relatorios'
import { exportToCSV } from '@/lib/export'
import { PeriodFilter } from '@/components/relatorios/PeriodFilter'
import { VolumeChart, TrendChart } from '@/components/relatorios/Charts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function VisaoGestao() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const isManager =
    user?.perfil === 'Gestor' || user?.perfil === 'Diretoria' || user?.perfil === 'Administrador'

  useEffect(() => {
    if (!isManager) {
      setLoading(false)
      return
    }
    getRelatorioData()
      .then(setData)
      .catch(() =>
        toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar dados.' }),
      )
      .finally(() => setLoading(false))
  }, [isManager])

  const filteredRegistros = useMemo(() => {
    if (!data) return []
    return filterByPeriod(data.registros, startDate, endDate)
  }, [data, startDate, endDate])

  if (!isManager) return <Navigate to="/" replace />
  if (loading)
    return <div className="py-12 text-center text-sm text-slate-500">Carregando dados...</div>
  if (!data)
    return <div className="py-12 text-center text-sm text-slate-500">Erro ao carregar dados.</div>

  const counts = getTipoCounts(filteredRegistros)
  const volumeData = [
    { tipo: 'Highlight', count: counts.Highlight },
    { tipo: 'Lowlight', count: counts.Lowlight },
    { tipo: 'Ação', count: counts['Ação para semana seguinte'] },
  ]
  const lowlightRanking = getLowlightRanking(filteredRegistros, 5)
  const trendData = getWeeklyTrend(filteredRegistros)
  const sellerStats = getSellerStats(filteredRegistros, data.users, data.clientes)
  const activeSellers = new Set(filteredRegistros.map((r) => r.responsavel)).size
  const totalSellers = data.users.length
  const teamCoverage = totalSellers > 0 ? Math.round((activeSellers / totalSellers) * 100) : 0

  const handleExport = () => {
    exportToCSV(
      'visao-gestao',
      [
        { key: 'vendedor', label: 'Vendedor' },
        { key: 'total', label: 'Total' },
        { key: 'highlights', label: 'Highlights' },
        { key: 'lowlights', label: 'Lowlights' },
        { key: 'acoes', label: 'Ações' },
        { key: 'pendentes', label: 'Pendentes' },
        { key: 'conclusao', label: 'Taxa Conclusão (%)' },
      ],
      sellerStats.map((s) => ({
        vendedor: s.user.name,
        total: s.total,
        highlights: s.highlights,
        lowlights: s.lowlights,
        acoes: s.actions,
        pendentes: s.pending,
        conclusao: s.completionRate,
      })),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Visão de Gestão
          </h1>
          <p className="text-sm text-slate-500 mt-1">Indicadores comerciais do time</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-4">
          <PeriodFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-100 bg-blue-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{teamCoverage}%</p>
            <p className="text-[11px] font-medium text-slate-600">Cobertura do time</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{counts.Highlight}</p>
            <p className="text-[11px] font-medium text-slate-600">Highlights</p>
          </CardContent>
        </Card>
        <Card className="border-rose-100 bg-rose-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-rose-600">{counts.Lowlight}</p>
            <p className="text-[11px] font-medium text-slate-600">Lowlights</p>
          </CardContent>
        </Card>
        <Card className="border-amber-100 bg-amber-50/50">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {counts['Ação para semana seguinte']}
            </p>
            <p className="text-[11px] font-medium text-slate-600">Ações</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Volume por tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volumeData} />
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900">Tendência semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
      </div>

      {lowlightRanking.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">Ranking de Lowlights</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {lowlightRanking.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm font-medium text-slate-700">
                    {i + 1}. {item.clienteNome}
                  </span>
                  <span className="text-sm font-bold text-rose-600">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Comparativo por vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Vendedor</th>
                  <th className="px-4 py-2.5 text-center">Total</th>
                  <th className="px-4 py-2.5 text-center">Highlights</th>
                  <th className="px-4 py-2.5 text-center">Lowlights</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                  <th className="px-4 py-2.5 text-center">Pendentes</th>
                  <th className="px-4 py-2.5 text-center">Conclusão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellerStats.map((s) => (
                  <tr key={s.user.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-semibold text-slate-900">{s.user.name}</td>
                    <td className="px-4 py-2.5 text-center text-slate-600">{s.total}</td>
                    <td className="px-4 py-2.5 text-center text-emerald-600 font-medium">
                      {s.highlights}
                    </td>
                    <td className="px-4 py-2.5 text-center text-rose-600 font-medium">
                      {s.lowlights}
                    </td>
                    <td className="px-4 py-2.5 text-center text-blue-600 font-medium">
                      {s.actions}
                    </td>
                    <td className="px-4 py-2.5 text-center text-amber-600 font-medium">
                      {s.pending}
                    </td>
                    <td className="px-4 py-2.5 text-center text-slate-600">{s.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
