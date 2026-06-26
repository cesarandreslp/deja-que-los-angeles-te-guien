import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/utils/auth'

type Role = 'USER' | 'CONSULTANT' | 'ADMIN'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    userId: string
    email: string
    role: Role
  }
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  allowedRoles?: Role[]
) {
  return async (request: NextRequest) => {
    try {
      // Obtener token del header Authorization
      const authHeader = request.headers.get('authorization')
      const token = authHeader?.replace('Bearer ', '')
      
      if (!token) {
        return NextResponse.json(
          { error: 'Token de autorización requerido' },
          { status: 401 }
        )
      }
      
      // Verificar token
      let decoded
      try {
        decoded = verifyToken(token)
      } catch (error) {
        return NextResponse.json(
          { error: 'Token inválido' },
          { status: 401 }
        )
      }
      
      if (decoded.type !== 'access') {
        return NextResponse.json(
          { error: 'Tipo de token inválido' },
          { status: 401 }
        )
      }
      
      // Verificar rol si es necesario
      if (allowedRoles && !allowedRoles.includes(decoded.role as Role)) {
        return NextResponse.json(
          { error: 'Permisos insuficientes' },
          { status: 403 }
        )
      }
      
      // Agregar información del usuario al request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      }
      
      return handler(authenticatedRequest)
      
    } catch (error) {
      console.error('Error en middleware de autenticación:', error)
      return NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      )
    }
  }
}