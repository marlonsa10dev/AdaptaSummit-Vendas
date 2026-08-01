import pb from '@/lib/pocketbase/client'
import type { Cliente } from '@/types'

export const getClientes = () =>
  pb.collection('clientes').getFullList<Cliente>({ expand: 'vendedor', sort: '-created' })

export const getCliente = (id: string) =>
  pb.collection('clientes').getOne<Cliente>(id, { expand: 'vendedor' })

export const createCliente = (data: { nome: string; vendedor: string }) =>
  pb.collection('clientes').create<Cliente>(data)

export const updateCliente = (id: string, data: { nome: string; vendedor: string }) =>
  pb.collection('clientes').update<Cliente>(id, data)

export const deleteCliente = (id: string) => pb.collection('clientes').delete(id)
