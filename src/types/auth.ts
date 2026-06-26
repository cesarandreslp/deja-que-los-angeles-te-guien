export interface User {
  id: string
  fullName: string
  email: string
  passwordHash?: string | null
  dateOfBirth?: Date | null
  country?: string | null
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null
  phone?: string | null
  profileImage?: string | null
  role: 'USER' | 'CONSULTANT' | 'ADMIN'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface RegisterData {
  fullName: string
  email: string
  password: string
  dateOfBirth: Date
  country: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface UpdateProfileData {
  fullName?: string
  country?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  phone?: string
  profileImage?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

// Tipos para NextAuth
export interface NextAuthUser {
  id: string
  email: string
  name: string
  image?: string
  role: 'USER' | 'CONSULTANT' | 'ADMIN'
  isActive: boolean
}