import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard } from '@/components/RoleGuard'
import { Layout } from '@/components/Layout'
import Login from '@/pages/Login'
import Index from '@/pages/Index'
import MinhaSemana from '@/pages/MinhaSemana'
import Clientes from '@/pages/Clientes'
import Registros from '@/pages/Registros'
import FichaCliente from '@/pages/FichaCliente'
import VisaoVendedor from '@/pages/VisaoVendedor'
import VisaoGestao from '@/pages/VisaoGestao'
import GestaoUsuarios from '@/pages/GestaoUsuarios'
import Auditoria from '@/pages/Auditoria'
import Ajuda from '@/pages/Ajuda'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { UserPerfil } from '@/types'

const adminOnly: UserPerfil[] = ['Administrador']

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/minha-semana" element={<MinhaSemana />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/registros" element={<Registros />} />
            <Route path="/ficha-cliente/:clienteId" element={<FichaCliente />} />
            <Route path="/visao-vendedor" element={<VisaoVendedor />} />
            <Route path="/visao-gestao" element={<VisaoGestao />} />
            <Route path="/ajuda" element={<Ajuda />} />
            <Route
              path="/gestao-usuarios"
              element={
                <RoleGuard allowedProfiles={adminOnly}>
                  <GestaoUsuarios />
                </RoleGuard>
              }
            />
            <Route
              path="/auditoria"
              element={
                <RoleGuard allowedProfiles={adminOnly}>
                  <Auditoria />
                </RoleGuard>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
