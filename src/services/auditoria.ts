import pb from '@/lib/pocketbase/client'
import type { Auditoria } from '@/types'

export interface AuditoriaFilters {
  usuario?: string
  acao?: string
  dataInicial?: string
  dataFinal?: string
}

export const getAuditoria = (filters?: AuditoriaFilters) => {
  const parts: string[] = []
  if (filters?.usuario) parts.push(`usuario = "${filters.usuario}"`)
  if (filters?.acao) parts.push(`acao = "${filters.acao}"`)
  if (filters?.dataInicial) parts.push(`created >= "${filters.dataInicial} 00:00:00"`)
  if (filters?.dataFinal) parts.push(`created <= "${filters.dataFinal} 23:59:59"`)
  const filter = parts.length > 0 ? parts.join(' && ') : undefined
  return pb.collection('auditoria').getFullList<Auditoria>({
    expand: 'usuario',
    sort: '-created',
    filter,
  })
}
