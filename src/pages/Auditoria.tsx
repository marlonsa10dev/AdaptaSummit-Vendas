import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import { getAuditoria, type AuditoriaFilters } from '@/services/auditoria'
import { getUsers } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import { formatBRDateTime } from '@/lib/date-utils'
import { exportToCSV } from '@/lib/export'
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import type { Auditoria, User } from '@/types'

export default function Auditoria() {
  const { toast } = useToast()
  const [registros, setRegistros] = useState<Auditoria[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedFilters, setAppliedFilters] = useState<AuditoriaFilters>({})
  const [usuarioFilter, setUsuarioFilter] = useState('all')
  const [acaoFilter, setAcaoFilter] = useState('')
  const [dataInicial, setDataInicial] = useState('')
  const [dataFinal, setDataFinal] = useState('')

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => {})
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAuditoria(appliedFilters)
      setRegistros(data)
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar auditoria.' })
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    setAppliedFilters({
      usuario: usuarioFilter !== 'all' ? usuarioFilter : undefined,
      acao: acaoFilter.trim() || undefined,
      dataInicial: dataInicial || undefined,
      dataFinal: dataFinal || undefined,
    })
  }

  const handleExport = () => {
    exportToCSV(
      'auditoria',
      [
        { key: 'usuario', label: 'Usuário' },
        { key: 'acao', label: 'Ação' },
        { key: 'entidade', label: 'Entidade' },
        { key: 'detalhes', label: 'Detalhes' },
        { key: 'created', label: 'Data/Hora' },
      ],
      registros.map((r) => ({
        usuario: r.expand?.usuario?.name || '—',
        acao: r.acao,
        entidade: r.entidade,
        detalhes: r.detalhes || '',
        created: formatBRDateTime(r.created),
      })),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Trilha de Auditoria
          </h1>
          <p className="text-sm text-slate-500 mt-1">Registro de todas as ações do sistema</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Usuário</Label>
              <Select value={usuarioFilter} onValueChange={setUsuarioFilter}>
                <SelectTrigger>
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
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Tipo de ação</Label>
              <Input
                placeholder="Ex: criou, atualizou..."
                value={acaoFilter}
                onChange={(e) => setAcaoFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Data inicial</Label>
              <Input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-slate-700">Data final</Label>
              <Input type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                className="w-full gap-2 bg-blue-600 text-xs hover:bg-blue-700"
              >
                <Search className="h-3.5 w-3.5" /> Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Registros ({registros.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Carregando...</div>
          ) : registros.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              Nenhum registro encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs">Usuário</TableHead>
                    <TableHead className="text-xs">Ação</TableHead>
                    <TableHead className="text-xs">Entidade</TableHead>
                    <TableHead className="text-xs">Detalhes</TableHead>
                    <TableHead className="text-xs">Data/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registros.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50/70">
                      <TableCell className="text-sm font-medium text-slate-900">
                        {r.expand?.usuario?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {r.acao}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{r.entidade}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-slate-500">
                        {r.detalhes || '—'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-500">
                        {formatBRDateTime(r.created)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
