import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { createUser, updateUser } from '@/services/users'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { User } from '@/types'

interface UserFormProps {
  editingUser: User | null
  onSaved: () => void
  onCancelEdit: () => void
}

export function UserForm({ editingUser, onSaved, onCancelEdit }: UserFormProps) {
  const { toast } = useToast()

  const [name, setName] = useState(editingUser?.name || '')
  const [email, setEmail] = useState(editingUser?.email || '')
  const [password, setPassword] = useState('')
  const [perfil, setPerfil] = useState(editingUser?.perfil || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'Preencha o campo Nome'
    if (!email.trim()) newErrors.email = 'Preencha o campo E-mail'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'E-mail inválido'
    if (!perfil) newErrors.perfil = 'Selecione um Perfil'
    if (!editingUser && !password) newErrors.password = 'Preencha o campo Senha'
    if (password && password.length < 8)
      newErrors.password = 'A senha deve ter no mínimo 8 caracteres'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      if (editingUser) {
        const payload: { name: string; email: string; perfil: string; password?: string } = {
          name: name.trim(),
          email: email.trim(),
          perfil,
        }
        if (password) payload.password = password
        await updateUser(editingUser.id, payload)
        toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso.' })
      } else {
        await createUser({ name: name.trim(), email: email.trim(), password, perfil })
        toast({ title: 'Sucesso', description: 'Usuário criado com sucesso.' })
      }
      onSaved()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        const mapped: Record<string, string> = {}
        if (fieldErrors.email) mapped.email = fieldErrors.email
        if (fieldErrors.password) mapped.password = fieldErrors.password
        if (fieldErrors.name) mapped.name = fieldErrors.name
        if (fieldErrors.perfil) mapped.perfil = fieldErrors.perfil
        setErrors(mapped)
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err?.message || 'Erro ao salvar usuário.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const resetFieldError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  return (
    <Card className="border-blue-100 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>{editingUser ? 'Editar usuário' : 'Novo usuário'}</span>
          {editingUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="text-xs text-slate-500 gap-1"
            >
              <X className="h-3.5 w-3.5" /> Cancelar edição
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Nome <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="Nome completo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  resetFieldError('name')
                }}
                className="bg-slate-50/50 focus:bg-white"
              />
              {errors.name && <p className="text-xs text-rose-600 font-medium">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                E-mail <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  resetFieldError('email')
                }}
                className="bg-slate-50/50 focus:bg-white"
              />
              {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Senha{' '}
                {editingUser && <span className="text-slate-400 font-normal">(opcional)</span>}
                {!editingUser && <span className="text-rose-500">*</span>}
              </Label>
              <Input
                type="password"
                placeholder={editingUser ? 'Deixe em branco para manter' : 'Mínimo 8 caracteres'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  resetFieldError('password')
                }}
                className="bg-slate-50/50 focus:bg-white"
              />
              {errors.password && (
                <p className="text-xs text-rose-600 font-medium">{errors.password}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Perfil <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={perfil}
                onValueChange={(v) => {
                  setPerfil(v)
                  resetFieldError('perfil')
                }}
              >
                <SelectTrigger className="bg-slate-50/50 focus:bg-white">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Diretoria">Diretoria</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                </SelectContent>
              </Select>
              {errors.perfil && (
                <p className="text-xs text-rose-600 font-medium">{errors.perfil}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            {editingUser && (
              <Button type="button" variant="outline" onClick={onCancelEdit} className="text-xs">
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
              ) : editingUser ? (
                'Atualizar usuário'
              ) : (
                'Salvar usuário'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
