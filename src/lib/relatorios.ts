import type { Registro, Cliente, User } from '@/types'
import { getDatePart, hasPendencia, getPendenciaStatus, formatDate } from '@/lib/pendencia'

export function filterByPeriod(registros: Registro[], start: string, end: string): Registro[] {
  return registros.filter((r) => {
    const d = getDatePart(r.data)
    if (start && d < start) return false
    if (end && d > end) return false
    return true
  })
}

export function getTipoCounts(registros: Registro[]) {
  return {
    Highlight: registros.filter((r) => r.tipo === 'Highlight').length,
    Lowlight: registros.filter((r) => r.tipo === 'Lowlight').length,
    'Ação para semana seguinte': registros.filter((r) => r.tipo === 'Ação para semana seguinte')
      .length,
  }
}

export function getCompletionRate(registros: Registro[]): number {
  const actions = registros.filter((r) => hasPendencia(r))
  if (actions.length === 0) return 0
  return Math.round((actions.filter((r) => r.status === 'Concluída').length / actions.length) * 100)
}

export function getOverduePendencias(registros: Registro[]): Registro[] {
  return registros.filter((r) => hasPendencia(r) && getPendenciaStatus(r) === 'Atrasada')
}

export function getPortfolioCoverage(
  registros: Registro[],
  clientes: Cliente[],
  vendedorId: string,
): number {
  const assigned = clientes.filter((c) => c.vendedor === vendedorId)
  if (assigned.length === 0) return 0
  const withRegistros = new Set(registros.map((r) => r.cliente))
  return Math.round(
    (assigned.filter((c) => withRegistros.has(c.id)).length / assigned.length) * 100,
  )
}

export function getLowlightRanking(registros: Registro[], limit = 10) {
  const map = new Map<string, number>()
  for (const r of registros.filter((r) => r.tipo === 'Lowlight')) {
    const nome = r.expand?.cliente?.nome || 'Desconhecido'
    map.set(nome, (map.get(nome) || 0) + 1)
  }
  return Array.from(map.entries())
    .map(([clienteNome, count]) => ({ clienteNome, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function getWeeklyTrend(registros: Registro[]) {
  const map = new Map<string, number>()
  for (const r of registros) {
    const d = new Date(getDatePart(r.data) + 'T00:00:00')
    const dayOfWeek = d.getDay()
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    d.setDate(d.getDate() - diff)
    const key = formatDate(d)
    map.set(key, (map.get(key) || 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, count]) => ({ week, count }))
}

export interface SellerStats {
  user: User
  total: number
  highlights: number
  lowlights: number
  actions: number
  pending: number
  completionRate: number
}

export function getSellerStats(
  registros: Registro[],
  users: User[],
  clientes: Cliente[],
): SellerStats[] {
  return users
    .map((user) => {
      const sellerRegistros = registros.filter((r) => r.responsavel === user.id)
      const counts = getTipoCounts(sellerRegistros)
      const pendencias = sellerRegistros.filter((r) => hasPendencia(r))
      const pending = pendencias.filter((r) => getPendenciaStatus(r) !== 'Concluída').length
      return {
        user,
        total: sellerRegistros.length,
        highlights: counts.Highlight,
        lowlights: counts.Lowlight,
        actions: counts['Ação para semana seguinte'],
        pending,
        completionRate: getCompletionRate(sellerRegistros),
      }
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total)
}
