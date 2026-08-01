import pb from '@/lib/pocketbase/client'
import type { Registro, Cliente, User } from '@/types'

export interface RelatorioData {
  registros: Registro[]
  users: User[]
  clientes: Cliente[]
}

export const getRelatorioData = () =>
  pb.send<RelatorioData>('/backend/v1/relatorios/dados', { method: 'GET' })
