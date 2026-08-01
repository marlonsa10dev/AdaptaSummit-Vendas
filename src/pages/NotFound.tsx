import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404: Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-lg text-slate-600 mb-6">Página não encontrada</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
