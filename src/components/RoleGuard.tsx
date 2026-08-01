import { ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { SemPermissao } from '@/components/SemPermissao'
import type { UserPerfil } from '@/types'

interface RoleGuardProps {
  allowedProfiles: UserPerfil[]
  children: ReactNode
}

export function RoleGuard({ allowedProfiles, children }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedProfiles.includes(user.perfil)) {
    return <SemPermissao />
  }

  return <>{children}</>
}
