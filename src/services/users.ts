import pb from '@/lib/pocketbase/client'
import type { User } from '@/types'

export const getUsers = () => pb.collection('users').getFullList<User>({ sort: 'name' })
export const getUser = (id: string) => pb.collection('users').getOne<User>(id)

export const createUser = (data: {
  name: string
  email: string
  password: string
  perfil: string
}) =>
  pb.collection('users').create<User>({
    name: data.name,
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    perfil: data.perfil,
    ativo: true,
  })

export const updateUser = (
  id: string,
  data: { name?: string; email?: string; perfil?: string; password?: string; ativo?: boolean },
) => {
  const payload: Record<string, any> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.email !== undefined) payload.email = data.email
  if (data.perfil !== undefined) payload.perfil = data.perfil
  if (data.ativo !== undefined) payload.ativo = data.ativo
  if (data.password) {
    payload.password = data.password
    payload.passwordConfirm = data.password
  }
  return pb.collection('users').update<User>(id, payload)
}
