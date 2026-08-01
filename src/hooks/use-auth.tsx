import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import type { User } from '@/types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(
    pb.authStore.isValid && pb.authStore.record ? (pb.authStore.record as unknown as User) : null,
  )
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(pb.authStore.isValid)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid && record ? (record as unknown as User) : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .then((res) => {
          setUser(res.record as unknown as User)
          setIsAuthenticated(true)
        })
        .catch(() => {
          pb.authStore.clear()
          setUser(null)
          setIsAuthenticated(false)
        })
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }

    return () => {
      unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await pb.collection('users').authWithPassword(email, password)
      setUser(res.record as unknown as User)
      setIsAuthenticated(true)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
