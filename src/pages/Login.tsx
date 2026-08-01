import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Login() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  if (isAuthenticated) {
    navigate('/', { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setEmailError('')
    setPasswordError('')

    let valid = true
    if (!email.trim()) {
      setEmailError('Informe o seu e-mail')
      valid = false
    }
    if (!password) {
      setPasswordError('Informe a sua senha')
      valid = false
    }

    if (!valid) return

    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    setLoading(false)

    if (error) {
      setErrorMessage('E-mail ou senha inválidos.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12 overflow-hidden">
      {/* Background Gradient & Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950" />
      <div
        className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl"
        aria-hidden="true"
      />

      <Card className="relative w-full max-w-md border-slate-800 bg-white/95 shadow-2xl backdrop-blur-md">
        <CardHeader className="space-y-3 text-center pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <TrendingUp className="h-7 w-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Acesse o painel de inteligência comercial
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4 bg-rose-50 border-rose-200 text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <AlertDescription className="text-sm font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>
              {emailError && <p className="text-xs text-rose-600 font-medium">{emailError}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-slate-50/50 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-rose-600 font-medium">{passwordError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 shadow-md shadow-blue-600/20 transition-all duration-150"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
