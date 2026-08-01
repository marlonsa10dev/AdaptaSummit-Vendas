import { useEffect, useState, useRef, useCallback } from 'react'
import {
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  Building2,
  FileText,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/services/clientes'
import { getUsers } from '@/services/users'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'
import { formatBR } from '@/lib/date-utils'
import type { Cliente, User } from '@/types'

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export default function Clientes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const formRef = useRef<HTMLDivElement>(null)

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendedores, setVendedores] = useState<User[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [vendedorId, setVendedorId] = useState('')
  const [saving, setSaving] = useState(false)
  const [showTypeahead, setShowTypeahead] = useState(false)
  const [duplicateWarning, setShowDuplicateWarning] = useState(false)
  const [nomeInlineError, setNomeInlineError] = useState('')
  const [vendedorInlineError, setVendedorInlineError] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.perfil === 'Administrador'

  const loadData = useCallback(async () => {
    try {
      const [clientesData, usersData] = await Promise.all([getClientes(), getUsers()])
      setClientes(clientesData)
      setVendedores(usersData)
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('clientes', () => {
    loadData()
  })

  useEffect(() => {
    if (vendedores.length > 0 && !vendedorId && user) {
      const foundSelf = vendedores.find((v) => v.id === user.id)
      if (foundSelf) setVendedorId(foundSelf.id)
      else setVendedorId(vendedores[0].id)
    }
  }, [vendedores, vendedorId, user])

  const matchingSuggestions = nome.trim()
    ? clientes.filter((c) => {
        if (editingId && c.id === editingId) return false
        return normalizeName(c.nome).includes(normalizeName(nome))
      })
    : []

  const handleNomeChange = (val: string) => {
    setNome(val)
    setNomeInlineError('')
    setShowDuplicateWarning(false)
    setShowTypeahead(val.trim().length > 0)
  }

  const handleSelectSuggestion = (cliente: Cliente) => {
    setNome(cliente.nome)
    setShowTypeahead(false)
    setShowDuplicateWarning(true)
    if (cliente.vendedor) setVendedorId(cliente.vendedor)
  }

  const resetForm = () => {
    setEditingId(null)
    setNome('')
    setShowTypeahead(false)
    setShowDuplicateWarning(false)
    setNomeInlineError('')
    setVendedorInlineError('')
    if (user && vendedores.some((v) => v.id === user.id)) {
      setVendedorId(user.id)
    } else if (vendedores.length > 0) {
      setVendedorId(vendedores[0].id)
    }
  }

  const handleFocusForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEdit = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setNome(cliente.nome)
    setVendedorId(cliente.vendedor)
    setShowDuplicateWarning(false)
    setNomeInlineError('')
    setVendedorInlineError('')
    handleFocusForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNomeInlineError('')
    setVendedorInlineError('')

    let valid = true
    if (!nome.trim()) {
      setNomeInlineError('O campo Nome é obrigatório.')
      valid = false
    }
    if (!vendedorId) {
      setVendedorInlineError('Selecione um vendedor responsável.')
      valid = false
    }

    if (!valid) return

    const cleanInput = normalizeName(nome)
    const isDuplicate = clientes.some((c) => {
      if (editingId && c.id === editingId) return false
      return normalizeName(c.nome) === cleanInput
    })

    if (isDuplicate) {
      setNomeInlineError('Já existe um cliente com esse nome.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateCliente(editingId, { nome: nome.trim(), vendedor: vendedorId })
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso.',
        })
      } else {
        await createCliente({ nome: nome.trim(), vendedor: vendedorId })
        toast({
          title: 'Sucesso',
          description: 'Cliente cadastrado com sucesso.',
        })
      }
      resetForm()
      loadData()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (fieldErrors.nome) setNomeInlineError(fieldErrors.nome)
      if (fieldErrors.vendedor) setVendedorInlineError(fieldErrors.vendedor)
      if (!fieldErrors.nome && !fieldErrors.vendedor) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err?.message || 'Erro ao salvar cliente. Tente novamente.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCliente) return
    setDeleting(true)
    try {
      await deleteCliente(deletingCliente.id)
      toast({
        title: 'Cliente excluído',
        description: `O cliente "${deletingCliente.nome}" foi removido com sucesso.`,
      })
      setDeletingCliente(null)
      loadData()
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: err?.message || 'Não foi possível excluir o cliente.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredClientes = clientes.filter((c) =>
    normalizeName(c.nome).includes(normalizeName(searchQuery)),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Cadastre e acompanhe seus clientes</p>
        </div>
        <Button
          onClick={handleFocusForm}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-semibold gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </Button>
      </div>

      {/* Form Card */}
      <div ref={formRef}>
        <Card className="border-blue-100 bg-white shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>{editingId ? 'Editar cliente' : 'Cadastrar cliente'}</span>
              {editingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-xs text-slate-500 gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar edição
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {duplicateWarning && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs font-medium">
                    Este cliente já está cadastrado no sistema.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome Input & Typeahead */}
                <div className="space-y-1.5 relative">
                  <Label htmlFor="nome" className="text-xs font-semibold text-slate-700">
                    Nome do cliente <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    placeholder="Ex: TechCorp Soluções"
                    value={nome}
                    onChange={(e) => handleNomeChange(e.target.value)}
                    onFocus={() => setShowTypeahead(nome.trim().length > 0)}
                    autoComplete="off"
                    className="bg-slate-50/50 focus:bg-white"
                  />

                  {showTypeahead && matchingSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg animate-fade-in">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Sugestões de clientes cadastrados:
                      </p>
                      {matchingSuggestions.map((sug) => (
                        <button
                          key={sug.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(sug)}
                          className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          <span className="font-medium">{sug.nome}</span>
                          <span className="text-[10px] text-slate-400">
                            ({sug.expand?.vendedor?.name || 'Vendedor'})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {nomeInlineError && (
                    <p className="text-xs text-rose-600 font-medium">{nomeInlineError}</p>
                  )}
                </div>

                {/* Vendedor Select */}
                <div className="space-y-1.5">
                  <Label htmlFor="vendedor" className="text-xs font-semibold text-slate-700">
                    Vendedor responsável <span className="text-rose-500">*</span>
                  </Label>
                  <Select value={vendedorId} onValueChange={(val) => setVendedorId(val)}>
                    <SelectTrigger id="vendedor" className="bg-slate-50/50 focus:bg-white">
                      <SelectValue placeholder="Selecione um vendedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendedores.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          <div className="flex items-center gap-2">
                            <span>{v.name}</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1 py-0 font-normal text-slate-500"
                            >
                              {v.perfil}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {vendedorInlineError && (
                    <p className="text-xs text-rose-600 font-medium">{vendedorInlineError}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm} className="text-xs">
                    Cancelar
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 px-5"
                >
                  {saving ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  ) : editingId ? (
                    'Atualizar cliente'
                  ) : (
                    'Salvar cliente'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List & Search Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Lista de clientes</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredClientes.length}{' '}
              {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50/50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loadingList ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Carregando lista de clientes...
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center p-4">
              <Building2 className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-800">Nenhum cliente encontrado</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {searchQuery ? 'Tente buscar por outro nome' : 'Nenhum cliente cadastrado ainda.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">Nome</th>
                      <th className="px-6 py-3">Vendedor responsável</th>
                      <th className="px-6 py-3">Data de cadastro</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-900">{cliente.nome}</td>
                        <td className="px-6 py-3.5 text-slate-600">
                          {cliente.expand?.vendedor?.name || 'Não informado'}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-slate-500">
                          {formatBR(cliente.created)}
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Ver ficha do cliente"
                          >
                            <Link to={`/ficha-cliente/${cliente.id}`}>
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              Ver ficha
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(cliente)}
                            className="h-8 px-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            title="Editar cliente"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>

                          {isAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingCliente(cliente)}
                              className="h-8 px-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                              title="Excluir cliente"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Excluir
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="h-8 px-2 text-slate-300 opacity-50 cursor-not-allowed"
                              title="Apenas administradores podem excluir clientes"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Excluir
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredClientes.map((cliente) => (
                  <div key={cliente.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm">{cliente.nome}</h3>
                      <span className="text-[11px] text-slate-400">
                        {formatBR(cliente.created)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Vendedor:{' '}
                      <span className="font-medium text-slate-700">
                        {cliente.expand?.vendedor?.name || 'Não informado'}
                      </span>
                    </p>

                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-50">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-7 text-xs text-slate-700"
                      >
                        <Link to={`/ficha-cliente/${cliente.id}`}>
                          <FileText className="h-3 w-3 mr-1" />
                          Ficha
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cliente)}
                        className="h-7 text-xs text-slate-700"
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>

                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingCliente(cliente)}
                          className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={!!deletingCliente}
        onOpenChange={(open) => !open && setDeletingCliente(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-slate-900">
              Excluir cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              Deseja realmente excluir o cliente{' '}
              <strong className="text-slate-900">{deletingCliente?.nome}</strong>? Essa ação
              removerá o cadastro permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="text-xs">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
            >
              {deleting ? 'Excluindo...' : 'Sim, excluir cliente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
