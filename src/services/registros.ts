import pb from '@/lib/pocketbase/client'
import type { Registro } from '@/types'

const EXPAND = 'cliente,responsavel,atualizadoPor'

export const getRegistros = () =>
  pb.collection('registros').getFullList<Registro>({ expand: EXPAND, sort: '-data' })

export const getRegistrosNaSemana = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  const isoStr = d.toISOString().replace('T', ' ')
  return pb.collection('registros').getFullList<Registro>({
    filter: `data >= "${isoStr}"`,
    expand: EXPAND,
    sort: '-data',
  })
}

export const createRegistro = (data: {
  tipo: string
  cliente: string
  data: string
  descricao: string
  proximaAcao?: string
  dataProximaAcao?: string
  status?: string
}) => pb.collection('registros').create<Registro>(data, { expand: EXPAND })

export const updateRegistro = (
  id: string,
  data: {
    tipo: string
    cliente: string
    data: string
    descricao: string
    proximaAcao?: string
    dataProximaAcao?: string
  },
) => pb.collection('registros').update<Registro>(id, data, { expand: EXPAND })

export const deleteRegistro = (id: string) => pb.collection('registros').delete(id)
