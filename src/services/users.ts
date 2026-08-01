import pb from '@/lib/pocketbase/client'
import type { User } from '@/types'

export const getUsers = () => pb.collection('users').getFullList<User>({ sort: 'name' })
export const getUser = (id: string) => pb.collection('users').getOne<User>(id)
