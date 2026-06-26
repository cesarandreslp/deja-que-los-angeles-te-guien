import { z } from 'zod'

// Validación para registro
export const registerSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email no válido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
  dateOfBirth: z.string().transform((str) => new Date(str)),
  country: z.string().min(2, 'Selecciona un país'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
})

// Validación para login
export const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Validación para actualizar perfil
export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  country: z.string().min(2, 'Selecciona un país').optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().optional(),
  profileImage: z.string().url('URL de imagen no válida').optional(),
})

// Validación para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
})

// Validación para recuperar contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email no válido'),
})

// Validación para resetear contraseña
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos: una minúscula, una mayúscula, un número y un símbolo'),
})