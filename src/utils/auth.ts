import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextAuthUser } from '@/types/auth'

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES_IN = '15m' // Access token expira en 15 minutos
const REFRESH_TOKEN_EXPIRES_IN = '7d' // Refresh token expira en 7 días

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generar Access Token
export function generateAccessToken(user: NextAuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

// Generar Refresh Token
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  )
}

// Verificar token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Token inválido')
  }
}

// Generar token de verificación/reset
export function generateRandomToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36)
}

// Verificar si el token ha expirado
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}