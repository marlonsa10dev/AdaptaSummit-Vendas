import pb from '@/lib/pocketbase/client'
import type { Registro } from '@/types'

export const getRegistros = () =>
  pb
    .collection('registros')
    .getFullList<Registro>({ expand: 'cliente,responsavel', sort: '-created' })

export const getRegistrosNaSemana = () => {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  const isoStr = d.toISOString().replace('T', ' ')
  return pb.collection('registros').getFullList<Registro>({
    filter: `data >= "${isoStr}"`,
    expand: 'cliente,responsavel',
    sort: '-created',
  })
}
