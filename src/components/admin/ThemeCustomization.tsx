'use client'

import { useState } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { getAllThemes } from '@/styles/themes'
import { ThemeId } from '@/types/theme'
import { 
  SwatchIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function ThemeCustomization() {
  const { currentTheme, themeId, applyTheme, isLoading } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>(themeId)
  const allThemes = getAllThemes()

  const handleApplyTheme = async () => {
    if (selectedTheme !== themeId) {
      await applyTheme(selectedTheme)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex items-center space-x-3 mb-8">
        <SwatchIcon 
          className="w-8 h-8"
          style={{color: currentTheme.colors.accent}}
        />
        <div>
          <h2 
            className="text-2xl font-bold"
            style={{
              fontFamily: currentTheme.typography.headingFont,
              color: currentTheme.colors.text
            }}
          >
            Personalización de Tema
          </h2>
          <p 
            className="text-sm opacity-75"
            style={{color: currentTheme.colors.textSecondary}}
          >
            Selecciona el tema visual para toda la aplicación
          </p>
        </div>
      </div>

      {/* Tema actual */}
      <div 
        className="card p-6 border-2"
        style={{borderColor: currentTheme.colors.accent}}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 
              className="text-lg font-semibold mb-2"
              style={{color: currentTheme.colors.text}}
            >
              Tema Actual: {currentTheme.name}
            </h3>
            <p 
              className="text-sm"
              style={{color: currentTheme.colors.textSecondary}}
            >
              {currentTheme.description}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-12 h-12 rounded-xl border-2 border-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.accent} 100%)`
              }}
            ></div>
            <CheckIcon 
              className="w-6 h-6"
              style={{color: currentTheme.colors.accent}}
            />
          </div>
        </div>
      </div>

      {/* Selector de temas */}
      <div>
        <h3 
          className="text-lg font-semibold mb-4"
          style={{color: currentTheme.colors.text}}
        >
          Temas Disponibles
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allThemes.map((theme) => {
            const isSelected = selectedTheme === theme.id
            const isCurrent = themeId === theme.id
            
            return (
              <div
                key={theme.id}
                className={`relative card p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-offset-2 scale-105' : ''
                }`}
                style={{
                  borderColor: isSelected ? currentTheme.colors.accent : currentTheme.colors.borderColor
                }}
                onClick={() => setSelectedTheme(theme.id as ThemeId)}
              >
                {/* Indicador de tema actual */}
                {isCurrent && (
                  <div 
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{backgroundColor: currentTheme.colors.accent}}
                  >
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Vista previa del tema */}
                <div className="mb-4">
                  <div 
                    className="h-20 rounded-lg border-2 border-white shadow-md mb-3 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.accent} 100%)`
                    }}
                  >
                    {/* Simulación de navbar */}
                    <div 
                      className="h-4 border-b opacity-80"
                      style={{
                        backgroundColor: theme.colors.navbarBg,
                        borderBottomColor: theme.colors.borderColor
                      }}
                    ></div>
                    
                    {/* Simulación de contenido */}
                    <div className="p-2 space-y-1">
                      <div 
                        className="h-2 w-3/4 rounded"
                        style={{backgroundColor: theme.colors.text, opacity: 0.7}}
                      ></div>
                      <div 
                        className="h-1 w-1/2 rounded"
                        style={{backgroundColor: theme.colors.textSecondary, opacity: 0.5}}
                      ></div>
                    </div>

                    {/* Botón de muestra */}
                    <div 
                      className="absolute bottom-2 right-2 w-8 h-3 rounded text-xs"
                      style={{background: theme.colors.buttonGradient}}
                    ></div>
                  </div>

                  {/* Paleta de colores */}
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded border border-white shadow-sm"
                      style={{backgroundColor: theme.colors.background}}
                      title="Fondo"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded border border-white shadow-sm"
                      style={{backgroundColor: theme.colors.accent}}
                      title="Acento"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded border border-white shadow-sm"
                      style={{backgroundColor: theme.colors.accentSecondary}}
                      title="Acento secundario"
                    ></div>
                    <div 
                      className="w-4 h-4 rounded border border-white shadow-sm"
                      style={{backgroundColor: theme.colors.text}}
                      title="Texto"
                    ></div>
                  </div>
                </div>

                {/* Información del tema */}
                <div>
                  <h4 
                    className="font-semibold mb-1"
                    style={{color: currentTheme.colors.text}}
                  >
                    {theme.name}
                  </h4>
                  <p 
                    className="text-xs leading-relaxed"
                    style={{color: currentTheme.colors.textSecondary}}
                  >
                    {theme.description}
                  </p>
                </div>

                {/* Indicador de selección */}
                {isSelected && (
                  <div 
                    className="absolute inset-0 rounded-lg border-2 pointer-events-none"
                    style={{borderColor: currentTheme.colors.accent}}
                  >
                    <div 
                      className="absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{backgroundColor: currentTheme.colors.accent}}
                    >
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Botón aplicar tema */}
      {selectedTheme !== themeId && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleApplyTheme}
            disabled={isLoading}
            className="btn btn-primary px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: currentTheme.colors.buttonGradient,
              fontFamily: currentTheme.typography.bodyFont
            }}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Aplicando tema...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SwatchIcon className="w-5 h-5" />
                <span>Aplicar Tema</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Mensaje de éxito */}
      {selectedTheme === themeId && selectedTheme !== 'CELESTIAL' && (
        <div 
          className="text-center py-4 rounded-lg"
          style={{
            backgroundColor: currentTheme.colors.background,
            color: currentTheme.colors.accent
          }}
        >
          <div className="flex items-center justify-center space-x-2">
            <CheckIcon className="w-5 h-5" />
            <span className="font-medium">Tema aplicado correctamente</span>
          </div>
        </div>
      )}
    </div>
  )
}