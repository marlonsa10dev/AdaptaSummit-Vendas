import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import Login from '@/pages/Login'
import Index from '@/pages/Index'
import Clientes from '@/pages/Clientes'
import NotFound from '@/pages/NotFound'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

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
            <Route path="/clientes" element={<Clientes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
