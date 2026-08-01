import { useEffect, useState } from 'react'
import { X, Loader2, Building2, Plus } from 'lucide-react'
import { getDatePart } from '@/lib/pendencia'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { createRegistro, updateRegistro } from '@/services/registros'
import { createCliente } from '@/services/clientes'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateInput } from '@/components/DateInput'
import type { Cliente, Registro } from '@/types'

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

interface RegistroFormProps {
  editingRegistro: Registro | null
  clientes: Cliente[]
  onSaved: () => void
  onCancelEdit: () => void
  onClientCreated: (cliente: Cliente) => void
}

export function RegistroForm({
  editingRegistro,
  clientes,
  onSaved,
  onCancelEdit,
  onClientCreated,
}: RegistroFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [tipo, setTipo] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [clienteSearch, setClienteSearch] = useState('')
  const [data, setData] = useState(formatDate(new Date()))
  const [descricao, setDescricao] = useState('')
  const [proximaAcao, setProximaAcao] = useState('')
  const [dataProximaAcao, setDataProximaAcao] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [creatingClient, setCreatingClient] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const todayStr = formatDate(now)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const minDateStr = formatDate(sevenDaysAgo)

  const showConditional = tipo === 'Lowlight' || tipo === 'Ação para semana seguinte'

  useEffect(() => {
    if (editingRegistro) {
      setTipo(editingRegistro.tipo)
      setClienteId(editingRegistro.cliente)
      setClienteSearch(editingRegistro.expand?.cliente?.nome || '')
      setData(getDatePart(editingRegistro.data))
      setDescricao(editingRegistro.descricao)
      setProximaAcao(editingRegistro.proximaAcao || '')
      setDataProximaAcao(getDatePart(editingRegistro.dataProximaAcao || ''))
    } else {
      setTipo('')
      setClienteId('')
      setClienteSearch('')
      setData(formatDate(new Date()))
      setDescricao('')
      setProximaAcao('')
      setDataProximaAcao('')
    }
    setErrors({})
  }, [editingRegistro])

  const clientSuggestions = clienteSearch.trim()
    ? clientes.filter((c) => normalizeName(c.nome).includes(normalizeName(clienteSearch)))
    : []

  const handleTipoChange = (val: string) => {
    setTipo(val)
    if (val === 'Highlight') {
      setProximaAcao('')
      setDataProximaAcao('')
    }
    setErrors((prev) => ({ ...prev, tipo: '', proximaAcao: '', dataProximaAcao: '' }))
  }

  const handleSelectClient = (cliente: Cliente) => {
    setClienteId(cliente.id)
    setClienteSearch(cliente.nome)
    setShowSuggestions(false)
    setErrors((prev) => ({ ...prev, cliente: '' }))
  }

  const handleCreateClient = async () => {
    if (!clienteSearch.trim() || !user) return
    setCreatingClient(true)
    try {
      const newClient = await createCliente({ nome: clienteSearch.trim(), vendedor: user.id })
      setClienteId(newClient.id)
      setShowSuggestions(false)
      onClientCreated(newClient)
      toast({ title: 'Cliente criado', description: `${newClient.nome} cadastrado com sucesso.` })
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (fieldErrors.nome) {
        const existing = clientes.find(
          (c) => normalizeName(c.nome) === normalizeName(clienteSearch),
        )
        if (existing) {
          setClienteId(existing.id)
          setShowSuggestions(false)
          toast({
            title: 'Cliente selecionado',
            description: `${existing.nome} já estava cadastrado.`,
          })
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: fieldErrors.nome })
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível criar o cliente.',
        })
      }
    } finally {
      setCreatingClient(false)
    }
  }

  const handleClienteBlur = () => {
    if (!clienteId && clienteSearch.trim()) {
      const exactMatch = clientes.find(
        (c) => normalizeName(c.nome) === normalizeName(clienteSearch),
      )
      if (exactMatch) setClienteId(exactMatch.id)
    }
    setTimeout(() => setShowSuggestions(false), 150)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!tipo) newErrors.tipo = 'Preencha o campo Tipo'
    if (!clienteId) newErrors.cliente = 'Preencha o campo Cliente'
    if (!data) newErrors.data = 'Preencha a Data'
    if (!descricao.trim()) newErrors.descricao = 'Preencha a Descrição'
    if (showConditional) {
      if (!proximaAcao.trim()) newErrors.proximaAcao = 'Preencha a Próxima ação'
      if (!dataProximaAcao) newErrors.dataProximaAcao = 'Informe a Data prevista'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
    try {
      const payload: Record<string, any> = {
        tipo,
        cliente: clienteId,
        data,
        descricao: descricao.trim(),
      }
      if (showConditional) {
        payload.proximaAcao = proximaAcao.trim()
        payload.dataProximaAcao = dataProximaAcao
      } else {
        payload.proximaAcao = ''
        payload.dataProximaAcao = ''
      }
      if (editingRegistro) {
        const tipoChanged = tipo !== editingRegistro.tipo
        const acaoChanged = proximaAcao.trim() !== (editingRegistro.proximaAcao || '').trim()
        if (tipoChanged || acaoChanged) {
          payload.status = 'Pendente'
          payload.dataConclusao = ''
        }
        await updateRegistro(editingRegistro.id, payload)
        toast({ title: 'Sucesso', description: 'Registro atualizado com sucesso.' })
      } else {
        payload.status = 'Pendente'
        await createRegistro(payload)
        toast({ title: 'Sucesso', description: 'Registro criado com sucesso.' })
      }
      onSaved()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors)
      else
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: err?.message || 'Erro ao salvar registro.',
        })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-blue-100 bg-white shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>{editingRegistro ? 'Editar registro' : 'Novo registro'}</span>
          {editingRegistro && (
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
                Tipo <span className="text-rose-500">*</span>
              </Label>
              <Select value={tipo} onValueChange={handleTipoChange}>
                <SelectTrigger className="bg-slate-50/50 focus:bg-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Highlight">Highlight</SelectItem>
                  <SelectItem value="Lowlight">Lowlight</SelectItem>
                  <SelectItem value="Ação para semana seguinte">
                    Ação para semana seguinte
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-rose-600 font-medium">{errors.tipo}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Data <span className="text-rose-500">*</span>
              </Label>
              <DateInput
                value={data}
                min={minDateStr}
                max={todayStr}
                onChange={(v) => {
                  setData(v)
                  setErrors((prev) => ({ ...prev, data: '' }))
                }}
                className="bg-slate-50/50 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400">Máx. 7 dias retroativo</p>
              {errors.data && <p className="text-xs text-rose-600 font-medium">{errors.data}</p>}
            </div>
          </div>

          <div className="space-y-1.5 relative">
            <Label className="text-xs font-semibold text-slate-700">
              Cliente <span className="text-rose-500">*</span>
            </Label>
            <Input
              placeholder="Busque ou digite o nome do cliente"
              value={clienteSearch}
              onChange={(e) => {
                setClienteSearch(e.target.value)
                setClienteId('')
                setShowSuggestions(e.target.value.trim().length > 0)
                setErrors((prev) => ({ ...prev, cliente: '' }))
              }}
              onFocus={() => setShowSuggestions(clienteSearch.trim().length > 0)}
              onBlur={handleClienteBlur}
              autoComplete="off"
              className="bg-slate-50/50 focus:bg-white"
            />
            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-52 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg animate-fade-in">
                {clientSuggestions.map((sug) => (
                  <button
                    key={sug.id}
                    type="button"
                    onMouseDown={() => handleSelectClient(sug)}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{sug.nome}</span>
                  </button>
                ))}
                {clienteSearch.trim() && (
                  <button
                    type="button"
                    onMouseDown={handleCreateClient}
                    disabled={creatingClient}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs hover:bg-emerald-50 text-emerald-700 transition-colors border-t border-slate-100 mt-1 pt-2"
                  >
                    {creatingClient ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span className="font-medium">Criar novo cliente: {clienteSearch}</span>
                  </button>
                )}
              </div>
            )}
            {errors.cliente && (
              <p className="text-xs text-rose-600 font-medium">{errors.cliente}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Descrição <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              placeholder="Descreva o que aconteceu e por que é importante"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value)
                setErrors((prev) => ({ ...prev, descricao: '' }))
              }}
              rows={3}
              className="bg-slate-50/50 focus:bg-white resize-none"
            />
            {errors.descricao && (
              <p className="text-xs text-rose-600 font-medium">{errors.descricao}</p>
            )}
          </div>

          {showConditional && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Próxima ação <span className="text-rose-500">*</span>
                </Label>
                <Input
                  placeholder="O que deve ser feito"
                  value={proximaAcao}
                  onChange={(e) => {
                    setProximaAcao(e.target.value)
                    setErrors((prev) => ({ ...prev, proximaAcao: '' }))
                  }}
                  className="bg-slate-50/50 focus:bg-white"
                />
                {errors.proximaAcao && (
                  <p className="text-xs text-rose-600 font-medium">{errors.proximaAcao}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  Data prevista <span className="text-rose-500">*</span>
                </Label>
                <DateInput
                  value={dataProximaAcao}
                  onChange={(v) => {
                    setDataProximaAcao(v)
                    setErrors((prev) => ({ ...prev, dataProximaAcao: '' }))
                  }}
                  className="bg-slate-50/50 focus:bg-white"
                />
                {errors.dataProximaAcao && (
                  <p className="text-xs text-rose-600 font-medium">{errors.dataProximaAcao}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Responsável</Label>
            <Input
              value={user?.name || ''}
              disabled
              className="bg-slate-100 text-slate-500 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingRegistro && (
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
              ) : editingRegistro ? (
                'Atualizar registro'
              ) : (
                'Salvar registro'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
