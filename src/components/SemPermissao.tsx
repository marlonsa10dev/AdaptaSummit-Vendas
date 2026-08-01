import { ShieldX } from 'lucide-react'

export function SemPermissao() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-4">
        <ShieldX className="h-8 w-8 text-rose-600" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Sem permissão</h1>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        Você não tem permissão para acessar esta página. Contate um administrador se precisar de
        acesso.
      </p>
    </div>
  )
}
