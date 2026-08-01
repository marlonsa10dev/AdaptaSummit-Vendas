import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, UserCheck, Activity, UserPlus, ArrowRight, Building2, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getClientes } from '@/services/clientes'
import { getUsers } from '@/services/users'
import { getRegistrosNaSemana } from '@/services/registros'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Cliente } from '@/types'

export default function Index() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [usersCount, setUsersCount] = useState<number>(0)
  const [registrosSemanaCount, setRegistrosSemanaCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  const loadData = useCallback(async () => {
    try {
      const [clientesData, usersData, registrosData] = await Promise.all([
        getClientes(),
        getUsers(),
        getRegistrosNaSemana().catch(() => []),
      ])
      setClientes(clientesData)
      setUsersCount(usersData.length)
      setRegistrosSemanaCount(registrosData.length)
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('clientes', () => {
    loadData()
  })

  useRealtime('registros', () => {
    loadData()
  })

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1)
  const recentClientes = clientes.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Olá, {user?.name || 'Usuário'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{capitalizedDate}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate('/clientes')}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 font-semibold gap-2 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar cliente
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Clientes cadastrados
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : clientes.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Total de contas registradas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vendedores ativos
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{loading ? '...' : usersCount}</div>
            <p className="text-xs text-slate-500 mt-1">Equipe comercial cadastrada</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Registros na semana
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '...' : registrosSemanaCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Highlights/Lowlights nos últimos 7 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Clientes Recentes */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Clientes recentes</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Últimas contas adicionadas à plataforma</p>
          </div>
          <Link
            to="/clientes"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-500">Carregando clientes...</div>
          ) : recentClientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-base font-semibold text-slate-800">
                Nenhum cliente cadastrado ainda
              </p>
              <p className="text-xs text-slate-500 max-w-xs mt-1 mb-4">
                Cadastre o seu primeiro cliente para começar a registrar atividades e interações.
              </p>
              <Button
                onClick={() => navigate('/clientes')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                Cadastrar o primeiro
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{cliente.nome}</p>
                      <p className="text-xs text-slate-500">
                        Vendedor:{' '}
                        <span className="font-medium text-slate-700">
                          {cliente.expand?.vendedor?.name || 'Não atribuído'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(cliente.created).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
