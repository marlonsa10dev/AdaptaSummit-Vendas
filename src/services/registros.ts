import pb from '@/lib/pocketbase/client'
import type { Registro } from '@/types'

const EXPAND = 'cliente,responsavel,atualizadoPor,cliente.vendedor'

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
    status?: string
    dataConclusao?: string
  },
) => pb.collection('registros').update<Registro>(id, data, { expand: EXPAND })

export const deleteRegistro = (id: string) => pb.collection('registros').delete(id)

export const getPendencias = () =>
  pb.collection('registros').getFullList<Registro>({
    filter: `proximaAcao != '' && status != 'Concluída'`,
    expand: EXPAND,
    sort: 'dataProximaAcao',
  })

export const concluirPendencia = (id: string) => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return pb
    .collection('registros')
    .update<Registro>(
      id,
      { status: 'Concluída', dataConclusao: `${y}-${m}-${d}` },
      { expand: EXPAND },
    )
}

export const reagendarPendencia = (id: string, dataProximaAcao: string) =>
  pb.collection('registros').update<Registro>(id, { dataProximaAcao }, { expand: EXPAND })
