import { useState, useEffect, useCallback } from 'react'
import { Pencil, Power } from 'lucide-react'
import { getUsers, updateUser } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { UserForm } from '@/components/UserForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { User } from '@/types'

export default function GestaoUsuarios() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar usuários.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useRealtime('users', () => {
    loadUsers()
  })

  const handleToggleAtivo = async (user: User) => {
    try {
      await updateUser(user.id, { ativo: !user.ativo })
      toast({
        title: 'Sucesso',
        description: `Usuário ${!user.ativo ? 'ativado' : 'desativado'}.`,
      })
      loadUsers()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar status.',
      })
    }
  }

  const getUserInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()

  const profileColors: Record<string, string> = {
    Administrador: 'bg-purple-100 text-purple-700',
    Diretoria: 'bg-blue-100 text-blue-700',
    Gestor: 'bg-emerald-100 text-emerald-700',
    Vendedor: 'bg-slate-100 text-slate-700',
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Gestão de Usuários
        </h1>
        <p className="text-sm text-slate-500 mt-1">Cadastre e gerencie usuários do sistema</p>
      </div>

      <UserForm
        editingUser={null}
        onSaved={() => {
          loadUsers()
        }}
        onCancelEdit={() => {}}
      />

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            {editingUser && <DialogDescription>{editingUser.name}</DialogDescription>}
          </DialogHeader>
          {editingUser && (
            <UserForm
              key={editingUser.id}
              editingUser={editingUser}
              dialogMode
              onSaved={() => {
                setEditingUser(null)
                loadUsers()
              }}
              onCancelEdit={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">
            Usuários cadastrados ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Carregando...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-xs">Nome</TableHead>
                    <TableHead className="text-xs">E-mail</TableHead>
                    <TableHead className="text-xs">Perfil</TableHead>
                    <TableHead className="text-xs text-center">Status</TableHead>
                    <TableHead className="text-xs text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/70">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 bg-blue-100 text-blue-700">
                            <AvatarFallback className="text-[10px] font-semibold">
                              {getUserInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          {u.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${profileColors[u.perfil] || ''}`}
                        >
                          {u.perfil}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={u.ativo === false ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {u.ativo === false ? 'Inativo' : 'Ativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingUser(u)}
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleAtivo(u)}
                            title={u.ativo === false ? 'Ativar' : 'Desativar'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
