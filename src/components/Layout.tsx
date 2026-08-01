import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  ClipboardList,
  CalendarCheck,
  BarChart3,
  PieChart,
  ShieldCheck,
  History,
  HelpCircle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export function Layout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => {
    signOut()
    navigate('/login')
  }

  const isManager =
    user?.perfil === 'Gestor' || user?.perfil === 'Diretoria' || user?.perfil === 'Administrador'
  const isAdmin = user?.perfil === 'Administrador'

  const navItems = [
    { label: 'Minha Semana', path: '/minha-semana', icon: CalendarCheck },
    { label: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { label: 'Clientes', path: '/clientes', icon: Users },
    { label: 'Registros', path: '/registros', icon: ClipboardList },
    { label: 'Visão por Vendedor', path: '/visao-vendedor', icon: BarChart3 },
    ...(isManager ? [{ label: 'Visão de Gestão', path: '/visao-gestao', icon: PieChart }] : []),
    { label: 'Ajuda', path: '/ajuda', icon: HelpCircle },
  ]

  const adminItems = [
    { label: 'Gestão de Usuários', path: '/gestao-usuarios', icon: ShieldCheck },
    { label: 'Trilha de Auditoria', path: '/auditoria', icon: History },
  ]

  const allNavPaths = [...navItems, ...(isAdmin ? adminItems : [])].map((i) => i.path)

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U'

  const allItems = [...navItems, ...(isAdmin ? adminItems : [])]
  const activeTitle =
    allItems.find((i) => i.path === location.pathname)?.label || 'Inteligência Comercial'

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Desktop */}
      <aside className="hidden w-[260px] flex-col justify-between border-r border-slate-200 bg-white p-5 shadow-sm lg:flex">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">Inteligência</h1>
              <p className="text-xs font-medium text-slate-500">Comercial por Cliente</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <Icon className={cn('h-4 w-4', isActive ? 'text-blue-600' : 'text-slate-500')} />
                  {item.label}
                </Link>
              )
            })}
            {isAdmin && (
              <>
                <div className="mt-3 px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Administração
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                        isActive
                          ? 'bg-purple-50 text-purple-600 shadow-sm font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                      )}
                    >
                      <Icon
                        className={cn('h-4 w-4', isActive ? 'text-purple-600' : 'text-slate-500')}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>
        </div>

        {/* User Card Desktop */}
        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar className="h-9 w-9 border border-blue-100 bg-blue-100 text-blue-700">
                <AvatarFallback className="text-xs font-semibold">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <span className="truncate text-xs font-semibold text-slate-900">
                  {user?.name || 'Usuário'}
                </span>
                <Badge
                  variant="secondary"
                  className="w-fit px-1.5 py-0 text-[10px] font-normal text-slate-600"
                >
                  {user?.perfil || 'Vendedor'}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair do sistema"
              className="h-8 w-8 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-700">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-5">
              <SheetHeader className="p-0 text-left">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-base font-bold text-slate-900">Inteligência Comercial</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="mt-6 flex flex-col gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
                {isAdmin && (
                  <>
                    <div className="mt-3 px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Administração
                    </div>
                    {adminItems.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname === item.path
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setDrawerOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-purple-50 text-purple-600 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </>
                )}
              </nav>

              <div className="mt-auto border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 bg-blue-100 text-blue-700">
                      <AvatarFallback className="text-xs font-semibold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-900">{user?.name}</span>
                      <span className="text-[10px] text-slate-500">{user?.perfil}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-slate-500"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-base font-semibold text-slate-800">{activeTitle}</h1>

          <Avatar className="h-8 w-8 border border-blue-100 bg-blue-100 text-blue-700">
            <AvatarFallback className="text-xs font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
        </header>

        {/* Content Area */}
        <main className="animate-fade-in-up flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
