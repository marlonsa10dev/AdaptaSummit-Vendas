import { useState, useEffect, useCallback } from 'react'
import { Pencil, Power, Trash2, Building2 } from 'lucide-react'
import { getUsers, updateUser, deleteUser } from '@/services/users'
import { getRelatorioData } from '@/services/relatorios'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { User, Cliente } from '@/types'

export default function GestaoUsuarios() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewingUserClients, setViewingUserClients] = useState<User | null>(null)

  const isAdmin = currentUser?.perfil === 'Administrador'

  const loadData = useCallback(async () => {
    try {
      if (isAdmin) {
        const [userData, relatorio] = await Promise.all([getUsers(), getRelatorioData()])
        setUsers(userData)
        setClientes(relatorio.clientes)
      } else {
        const relatorio = await getRelatorioData()
        setUsers(relatorio.users)
        setClientes(relatorio.clientes)
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao carregar usuários.' })
    } finally {
      setLoading(false)
    }
  }, [toast, isAdmin])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('users', () => {
    loadData()
  })
  useRealtime('clientes', () => {
    loadData()
  })

  const handleToggleAtivo = async (user: User) => {
    try {
      await updateUser(user.id, { ativo: !user.ativo })
      toast({ title: 'Sucesso', description: `Usuário ${!user.ativo ? 'ativado' : 'desativado'}.` })
      loadData()
    } catch {
      toast({ variant: 'destructive', title: 'Erro', description: 'Falha ao atualizar status.' })
    }
  }

  const handleDeleteClick = (user: User) => {
    if (currentUser && user.id === currentUser.id) {
      toast({
        variant: 'destructive',
        title: 'Ação bloqueada',
        description: 'Você não pode excluir o seu próprio usuário.',
      })
      return
    }
    setDeleteError(null)
    setUserToDelete(user)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      await deleteUser(userToDelete.id)
      toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso.' })
      setUserToDelete(null)
      loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('próprio usuário')) {
        setDeleteError('Você não pode excluir o seu próprio usuário.')
      } else {
        setDeleteError(
          'Não foi possível excluir o usuário. Verifique se não há dados vinculados e tente novamente.',
        )
      }
    } finally {
      setIsDeleting(false)
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

  const getClienteCount = (userId: string) => clientes.filter((c) => c.vendedor === userId).length
  const getClientNames = (userId: string) =>
    clientes.filter((c) => c.vendedor === userId).map((c) => c.nome)

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
          Gestão de Usuários
        </h1>
        <p className="text-sm text-slate-500 mt-1">Cadastre e gerencie usuários do sistema</p>
      </div>

      {isAdmin && (
        <UserForm
          editingUser={null}
          onSaved={() => {
            loadData()
          }}
          onCancelEdit={() => {}}
        />
      )}

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
                loadData()
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
                    <TableHead className="text-xs text-center">Clientes</TableHead>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 gap-1"
                          onClick={() => setViewingUserClients(u)}
                          title="Ver clientes atribuídos"
                        >
                          <Building2 className="h-3 w-3" />
                          {getClienteCount(u.id)}
                        </Button>
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
                          {isAdmin && (
                            <>
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
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteClick(u)}
                                title="Excluir"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
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

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setUserToDelete(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o usuário{' '}
              <strong>{userToDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm font-medium text-red-600">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleConfirmDelete()
              }}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!viewingUserClients}
        onOpenChange={(open) => {
          if (!open) setViewingUserClients(null)
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500" />
              Clientes de {viewingUserClients?.name}
            </DialogTitle>
            <DialogDescription>
              {getClienteCount(viewingUserClients?.id || '')} cliente(s) atribuído(s) a este
              vendedor.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto">
            {getClienteCount(viewingUserClients?.id || '') === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Building2 className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-700">Nenhum cliente atribuído</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Este vendedor ainda não possui clientes vinculados.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {getClientNames(viewingUserClients?.id || '').map((nome, i) => (
                  <li key={i} className="flex items-center gap-2 py-2 text-sm text-slate-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {nome}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
