export type UserPerfil = 'Vendedor' | 'Gestor' | 'Diretoria' | 'Administrador'

export interface User {
  id: string
  email: string
  name: string
  perfil: UserPerfil
  avatar?: string
  created: string
  updated: string
}

export interface Cliente {
  id: string
  nome: string
  vendedor: string
  expand?: {
    vendedor?: User
  }
  created: string
  updated: string
}

export type TipoRegistro = 'Highlight' | 'Lowlight' | 'Ação para semana seguinte'

export interface Registro {
  id: string
  data: string
  tipo: TipoRegistro
  descricao: string
  cliente: string
  proximaAcao?: string
  dataProximaAcao?: string
  status: 'Pendente' | 'Concluída'
  responsavel: string
  atualizadoPor?: string
  expand?: {
    cliente?: Cliente
    responsavel?: User
    atualizadoPor?: User
  }
  created: string
  updated: string
}
