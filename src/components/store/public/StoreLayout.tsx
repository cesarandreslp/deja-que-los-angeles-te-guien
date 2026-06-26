// Store Layout - Main layout for public store pages
'use client'

import { useTheme } from '@/context/ThemeContext'
import { useCart } from '@/context/CartContext'
import Link from 'next/link'
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import CartSidebar from './CartSidebar'

interface StoreLayoutProps {
  children: React.ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  const { currentTheme } = useTheme()
  const { totalItems } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCartSidebar, setShowCartSidebar] = useState(false)
  
  return (
            <div className="min-h-screen" style={{ backgroundColor: currentTheme.colors.background }}>
      {/* Store Header */}
      <header className={`${currentTheme.colors.cardBg} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/tienda" className="flex-shrink-0">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                  style={{ backgroundColor: currentTheme.colors.accent }}
                >
                  <span className="text-white font-bold text-lg">⚡</span>
                </div>
                <span 
                  className="text-xl font-bold"
                  style={{ color: currentTheme.colors.text }}
                >
                  Tienda Angélica
                </span>
              </div>
            </Link>
            
            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className={`h-5 w-5 ${currentTheme.colors.textSecondary}`} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 ${currentTheme.colors.background} ${currentTheme.colors.text} placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Buscar productos angelicales..."
                />
              </div>
            </div>
            
            {/* Right Navigation */}
            <div className="flex items-center space-x-4">
              {/* User Account */}
              <Link href="/auth/signin" className={`${currentTheme.colors.textSecondary} hover:${currentTheme.colors.text} p-2`}>
                <UserIcon className="h-6 w-6" />
              </Link>
              
              {/* Shopping Cart */}
              <button 
                onClick={() => setShowCartSidebar(true)} 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCartIcon 
                  className="h-6 w-6" 
                  style={{ color: currentTheme.colors.textSecondary }}
                />
                {totalItems > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                    style={{ backgroundColor: currentTheme.colors.accent }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
                  <nav className="shadow-lg sticky top-0 z-40" style={{ backgroundColor: currentTheme.colors.navbarBg }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 h-12 items-center">
              <Link href="/tienda" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Inicio
              </Link>
              <Link href="/tienda/productos" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Productos
              </Link>
              <Link href="/tienda/categorias/cristales" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Cristales
              </Link>
              <Link href="/tienda/categorias/velas" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Velas
              </Link>
              <Link href="/tienda/categorias/inciensos" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Inciensos
              </Link>
              <Link href="/tienda/categorias/aceites" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Aceites
              </Link>
              <Link href="/tienda/categorias/libros" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Libros
              </Link>
              <Link href="/tienda/contacto" className={`${currentTheme.colors.text} hover:text-white transition-colors font-medium`}>
                Contacto
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
      
      {/* Store Footer */}
      <footer className={`${currentTheme.colors.cardBg} ${currentTheme.colors.text} py-12 mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tienda Angélica</h3>
              <p className={`${currentTheme.colors.textSecondary} text-sm`}>
                Tu tienda espiritual de confianza. Productos genuinos para tu crecimiento personal y espiritual.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tienda/productos" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Productos</Link></li>
                <li><Link href="/tienda/ofertas" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Ofertas</Link></li>
                <li><Link href="/tienda/favoritos" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Favoritos</Link></li>
                <li><Link href="/tienda/mi-cuenta" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Mi Cuenta</Link></li>
              </ul>
            </div>
            
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Categorías</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tienda/categorias/cristales" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Cristales</Link></li>
                <li><Link href="/tienda/categorias/velas" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Velas</Link></li>
                <li><Link href="/tienda/categorias/inciensos" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Inciensos</Link></li>
                <li><Link href="/tienda/categorias/aceites" className={`${currentTheme.colors.textSecondary} hover:text-white`}>Aceites</Link></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className={`${currentTheme.colors.textSecondary} text-sm space-y-2`}>
                <p>📧 tienda@oraculo.com</p>
                <p>📱 +1 234 567 890</p>
                <p>🏪 Lun - Vie: 9:00 - 18:00</p>
                <p>🌙 Sáb - Dom: 10:00 - 16:00</p>
              </div>
            </div>
          </div>
          
          <div className={`border-t ${currentTheme.colors.borderColor} mt-8 pt-8 text-center`}>
            <p className={`${currentTheme.colors.textSecondary} text-sm`}>
              © 2024 Tienda Angélica - Oráculo Espiritual. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCartSidebar} 
        onClose={() => setShowCartSidebar(false)} 
      />
    </div>
  )
}