import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Crear respuesta
    const response = NextResponse.next()

    // Configurar headers para mejorar el caching de sesión
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/oraculo')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
    }

    // Nota: Verificación de modo mantenimiento removida del middleware
    // debido a limitaciones de Edge Runtime con Prisma.
    // Esta verificación se maneja ahora en las páginas individuales.

    // Rutas que requieren autenticación
    if (pathname.startsWith('/dashboard') || 
        pathname.startsWith('/admin') || 
        pathname.startsWith('/consultant') || 
        pathname.startsWith('/user') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/carrito') ||
        pathname.startsWith('/checkout') ||
        pathname.startsWith('/mi-cuenta') ||
        pathname.startsWith('/mis-pedidos')) {
      
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    // Rutas específicas por rol
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    if (pathname.startsWith('/consultant')) {
      if (token?.role !== 'CONSULTANT') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    if (pathname.startsWith('/user')) {
      if (token?.role !== 'USER') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Redirección para usuarios ya autenticados en páginas públicas
    if ((pathname === '/login' || pathname === '/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Permitir acceso a páginas públicas
        if (pathname === '/' || 
            pathname === '/login' || 
            pathname === '/register' ||
            pathname === '/maintenance' ||
            pathname.startsWith('/blog') ||
            pathname.startsWith('/tienda') ||
            pathname.startsWith('/book-consultation') ||
            pathname.startsWith('/consultas') ||
            pathname.startsWith('/arcangel-mentor') ||
            pathname.startsWith('/mentor') ||
            pathname.startsWith('/arcangeles-chat') ||
            pathname.startsWith('/oraculo/arcangeles-chat') ||
            pathname.startsWith('/auth/') ||
            pathname.startsWith('/api/auth/') ||
            pathname.startsWith('/api/products') ||
            pathname.startsWith('/api/store') ||
            pathname.startsWith('/api/consultants') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon')) {
          return true
        }

        // Requerir token para todas las demás rutas
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth API routes)
     * - api/blog (Blog API routes - should be public)
     * - api/products (Products API routes - should be public for browsing)
     * - api/store (Store API routes - should be public for browsing)
     * - arcangeles-chat (arcangel images - should be public)
     * - oraculo (oraculo assets - should be public)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|api/blog|api/products|api/store|arcangeles-chat|oraculo).*)',
  ],
}