import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
// import GoogleProvider from 'next-auth/providers/google' // DESHABILITADO
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/utils/auth'
import { NextAuthUser } from '@/types/auth'

export const authOptions: NextAuthOptions = {
  // Comentar el adapter para evitar conflictos con CredentialsProvider
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          if (!user.isActive) {
            throw new Error('Cuenta no verificada. Revisa tu email.')
          }

          const isValidPassword = await verifyPassword(credentials.password, user.passwordHash)
          
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.profileImage || undefined,
            role: user.role,
            isActive: user.isActive,
          } as NextAuthUser
        } catch (error) {
          console.error('Error en autorización:', error)
          return null
        }
      }
    }),
    
    // GOOGLE PROVIDER DESHABILITADO SEGÚN INSTRUCCIONES
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    */
  ],
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as NextAuthUser).role
        token.isActive = (user as NextAuthUser).isActive
      }
      return token
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as 'USER' | 'CONSULTANT' | 'ADMIN'
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
    
    async signIn({ user, account }) {
      // Para Google OAuth (cuando se habilite)
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (existingUser) {
            // Usuario existe, vincular cuenta
            return true
          } else {
            // Crear nuevo usuario con datos mínimos
            await prisma.user.create({
              data: {
                fullName: user.name!,
                email: user.email!,
                profileImage: user.image || null,
                isActive: true, // Google users are pre-verified
                // Los campos obligatorios se completarán en el perfil
              }
            })
            return true
          }
        } catch (error) {
          console.error('Error en signIn callback:', error)
          return false
        }
      }
      
      return true
    }
  },
  
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // Actualizar cada 24 horas
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: undefined
      }
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      console.log('✅ SignIn event:', { user: user.email, provider: account?.provider })
    },
    async signOut({ session, token }) {
      console.log('🚪 SignOut event:', { user: session?.user?.email })
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  secret: process.env.NEXTAUTH_SECRET,
}

