import {
  HelpCircle,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Users,
  Shield,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const recordTypes = [
  {
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'Highlight',
    description:
      'Registre momentos positivos: vitórias, bons resultados, contratos fechados ou qualquer conquista com o cliente.',
  },
  {
    icon: TrendingDown,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    title: 'Lowlight',
    description:
      'Registre dificuldades, problemas ou obstáculos. Exige obrigatoriamente uma Próxima Ação e uma data prevista para resolução.',
  },
  {
    icon: CalendarClock,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'Ação para semana seguinte',
    description:
      'Planeje o que será feito na próxima semana. Também exige Próxima Ação e data prevista, gerando uma pendência em "Minha Semana".',
  },
]

const profiles = [
  {
    perfil: 'Vendedor',
    color: 'bg-slate-100 text-slate-700',
    permissions: [
      'Vê apenas seus próprios clientes e registros',
      'Cria e edita seus registros',
      'Acompanha suas pendências em "Minha Semana"',
    ],
  },
  {
    perfil: 'Gestor',
    color: 'bg-emerald-100 text-emerald-700',
    permissions: [
      'Vê todos os clientes e registros da equipe',
      'Acesso à "Visão de Gestão" com indicadores do time',
      'Acesso à "Visão por Vendedor"',
    ],
  },
  {
    perfil: 'Diretoria',
    color: 'bg-blue-100 text-blue-700',
    permissions: ['Mesmo acesso do Gestor', 'Visão estratégica de todos os dados comerciais'],
  },
  {
    perfil: 'Administrador',
    color: 'bg-purple-100 text-purple-700',
    permissions: [
      'Gerencia usuários (criar, editar, ativar/desativar)',
      'Acesso à Trilha de Auditoria',
      'Acesso total ao sistema',
    ],
  },
]

const quickSteps = [
  'Faça login com seu e-mail e senha.',
  'Cadastre seus clientes em "Clientes".',
  'Registre highlights, lowlights e ações em "Registros".',
  'Acompanhe e conclua suas pendências em "Minha Semana".',
  'Gestores acompanham indicadores em "Visão de Gestão".',
]

export default function Ajuda() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Ajuda</h1>
            <p className="text-sm text-slate-500 mt-1">Guia completo e rápido do sistema</p>
          </div>
        </div>
      </div>

      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
        <CardContent className="pt-5">
          <h2 className="text-base font-bold text-slate-900 mb-2">O que é o sistema?</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            O <strong>Inteligência Comercial por Cliente</strong> é um sistema para monitorar
            atividades de vendas, registrando{' '}
            <span className="text-emerald-600 font-medium">highlights</span> (positivos),
            <span className="text-rose-600 font-medium"> lowlights</span> (negativos) e
            <span className="text-blue-600 font-medium"> ações para a semana seguinte</span> por
            cliente. Permite acompanhar pendências, visualizar indicadores e manter um histórico
            auditável de toda a operação comercial.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Tipos de Registro</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {recordTypes.map((rt) => {
            const Icon = rt.icon
            return (
              <div key={rt.title} className={`flex gap-3 rounded-lg border p-3 ${rt.bg}`}>
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white ${rt.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{rt.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{rt.description}</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900">Ciclo Semanal</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Sexta-feira — Registro</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Os vendedores registram os highlights, lowlights e ações da semana em "Registros".
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Segunda-feira — Execução</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Os vendedores executam as ações planejadas, acompanhando as pendências em "Minha
                  Semana".
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 text-xs font-bold">
                3
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Durante a semana — Acompanhamento
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Conclua as pendências no prazo. Pendências com data passada aparecem como
                  "Atrasada".
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-500" /> Permissões por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {profiles.map((p) => (
            <div key={p.perfil} className="rounded-lg border border-slate-200 p-3">
              <Badge className={`text-xs mb-2 ${p.color}`}>{p.perfil}</Badge>
              <ul className="space-y-1">
                {p.permissions.map((perm, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <ChevronRight className="h-3 w-3 mt-0.5 text-slate-400 flex-shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" /> Guia Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ol className="space-y-2.5">
            {quickSteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
        <CardContent className="pt-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-amber-700">Dados de demonstração:</strong> O sistema já vem com
            usuários, clientes e registros de exemplo. Usuários demo usam a senha{' '}
            <code className="px-1 py-0.5 rounded bg-amber-100 text-amber-800">Skip@Pass</code>.
            Entre em contato com o administrador para começar a usar com dados reais.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
