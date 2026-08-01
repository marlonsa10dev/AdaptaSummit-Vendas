import type { Registro } from '@/types'

export type PendenciaStatus = 'Pendente' | 'Concluída' | 'Atrasada'

export function getDatePart(dateStr: string): string {
  return dateStr?.split(' ')[0]?.split('T')[0] || ''
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function hasPendencia(registro: Registro): boolean {
  return !!(registro.proximaAcao && registro.dataProximaAcao)
}

export function getPendenciaStatus(registro: Registro): PendenciaStatus {
  if (registro.status === 'Concluída') return 'Concluída'
  const today = formatDate(new Date())
  const dataPrevista = getDatePart(registro.dataProximaAcao || '')
  if (dataPrevista && dataPrevista < today) return 'Atrasada'
  return 'Pendente'
}

export interface PendenciaGroups {
  atrasadas: Registro[]
  hoje: Registro[]
  proximos7Dias: Registro[]
  concluidasSemana: Registro[]
}

export function groupPendencias(registros: Registro[]): PendenciaGroups {
  const today = formatDate(new Date())
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const startOfWeek = new Date(now)
  startOfWeek.setDate(startOfWeek.getDate() - diff)
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfWeekStr = formatDate(startOfWeek)
  const in7Days = new Date(now)
  in7Days.setDate(in7Days.getDate() + 7)
  const in7DaysStr = formatDate(in7Days)

  const groups: PendenciaGroups = {
    atrasadas: [],
    hoje: [],
    proximos7Dias: [],
    concluidasSemana: [],
  }

  for (const r of registros) {
    if (!hasPendencia(r)) continue
    const status = getPendenciaStatus(r)
    const dataPrevista = getDatePart(r.dataProximaAcao || '')

    if (status === 'Concluída') {
      const conclusaoDate = getDatePart(r.dataConclusao || r.updated || '')
      if (conclusaoDate >= startOfWeekStr) {
        groups.concluidasSemana.push(r)
      }
    } else if (status === 'Atrasada') {
      groups.atrasadas.push(r)
    } else if (dataPrevista === today) {
      groups.hoje.push(r)
    } else if (dataPrevista > today && dataPrevista <= in7DaysStr) {
      groups.proximos7Dias.push(r)
    }
  }

  return groups
}
