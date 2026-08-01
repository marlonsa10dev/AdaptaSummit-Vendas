import { useState, useEffect, useCallback } from 'react'
import { ScrollText, Search, Loader2, Filter } from 'lucide-react'
import { getAuditoria, type AuditoriaFilters } from '@/services/auditoria'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Auditoria, User } from '@/types'
import { formatBRDateTime } from '@/lib/date-utils'

export default function TrilhaAuditoria() {
  const [auditoria, setAuditoria] = useState<Auditoria[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditoriaFilters>({})

  const loadData = useCallback(async () => {
    try {
      const [audData, userData] = await Promise.all([getAuditoria(filters), getUsers()])
      setAuditoria(audData)
      setUsers(userData)
    } catch {
      setAuditoria([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('auditoria', () => {
    loadData()
  })

  const handleFilterChange = (key: keyof AuditoriaFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  const handleClear = () => {
    setFilters({})
  }

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name || 'Usuário removido'

  const getActionColor = (acao: string) => {
    if (acao.includes('criou') || acao.includes('create')) return 'bg-emerald-100 text-emerald-700'
    if (acao.includes('editou') || acao.includes('update')) return 'bg-blue-100 text-blue-700'
    if (acao.includes('excluiu') || acao.includes('delete')) return 'bg-rose-100 text-rose-700'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Trilha de Auditoria
        </h1>
        <p className="text-sm text-slate-500 mt-1">Histórico de ações realizadas no sistema</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Usuário</Label>
              <Select
                value={filters.usuario || ''}
                onValueChange={(v) => handleFilterChange('usuario', v === 'all' ? '' : v)}
              >
                <SelectTrigger className="bg-slate-50/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Ação</Label>
              <Input
                placeholder="Buscar por ação..."
                value={filters.acao || ''}
                onChange={(e) => handleFilterChange('acao', e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Data inicial</Label>
              <Input
                type="date"
                value={filters.dataInicial || ''}
                onChange={(e) => handleFilterChange('dataInicial', e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Data final</Label>
              <Input
                type="date"
                value={filters.dataFinal || ''}
                onChange={(e) => handleFilterChange('dataFinal', e.target.value)}
                className="bg-slate-50/50"
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="outline" size="sm" onClick={handleClear} className="text-xs gap-1.5">
              Limpar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : auditoria.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <ScrollText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Nenhum registro de auditoria encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              Registros ({auditoria.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {auditoria.map((item) => (
                <div key={item.id} className="px-4 py-3 hover:bg-slate-50/70">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] ${getActionColor(item.acao)}`}>
                          {item.acao}
                        </Badge>
                        <span className="text-xs font-medium text-slate-400">
                          {item.entidade}
                          {item.entidadeId ? ` #${item.entidadeId.substring(0, 8)}` : ''}
                        </span>
                      </div>
                      {item.detalhes && (
                        <p className="text-xs text-slate-600 mt-1">{item.detalhes}</p>
                      )}
                      <p className="text-[11px] text-slate-400 mt-1">
                        {formatBRDateTime(item.created)}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {getUserName(item.usuario)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
