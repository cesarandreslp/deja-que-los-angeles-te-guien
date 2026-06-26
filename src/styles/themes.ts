import { Theme, ThemeId } from '@/types/theme'

export const themes: Record<ThemeId, Theme> = {
  CELESTIAL: {
    id: 'CELESTIAL',
    name: 'Arcángel Celestial',
    description: 'Tema personalizado con paleta CMYK específica',
    colors: {
      background: '#002650', // C100 M90 Y0 K50 - Fondo azul profundo
      text: '#F0E6D6', // C0 M5 Y15 K5 - Texto claro cálido
      textSecondary: '#E0D0B8', // Variante más suave del texto
      accent: '#00A0FF', // C100 M40 Y0 K0 - Botón primario azul brillante
      accentSecondary: '#0050CC', // C100 M80 Y0 K0 - Botón secundario azul más oscuro
      navbarBg: '#1A1A4D', // C100 M100 Y40 K40 - Navbar azul púrpura oscuro con semi-transparencia
      footerBg: '#1A1A4D', // C100 M100 Y40 K40 - Footer igual al navbar
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)', // Gradiente entre los dos botones
      cardBg: 'rgba(0, 38, 80, 0.8)', // Fondo de tarjetas semi-transparente
      borderColor: '#003366', // Bordes más claros que el fondo
      shadowColor: 'rgba(0, 160, 255, 0.2)' // Sombra con color accent
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },
  
  AURORA: {
    id: 'AURORA',
    name: 'Aurora Boreal',
    description: 'Variante Aurora con paleta CMYK personalizada',
    colors: {
      background: '#003366', // Fondo más claro que CELESTIAL pero siguiendo la paleta
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 51, 102, 0.8)', // Variante más clara del fondo
      borderColor: '#004080',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },

  ARCANGELES: {
    id: 'ARCANGELES',
    name: 'Arcángeles Divinos',
    description: 'Tema Arcángeles con paleta CMYK personalizada',
    colors: {
      background: '#001A33', // Fondo más oscuro para variación
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 26, 51, 0.8)', // Variante más oscura
      borderColor: '#002B5C',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },

  MINIMAL: {
    id: 'MINIMAL',
    name: 'Minimalista Puro',
    description: 'Minimalista con paleta CMYK personalizada',
    colors: {
      background: '#004080', // Variante intermedia del fondo
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 64, 128, 0.8)', // Variante intermedia
      borderColor: '#0059B3',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },

  LUZ_DIVINA: {
    id: 'LUZ_DIVINA',
    name: 'Luz Divina',
    description: 'Luz Divina con paleta CMYK personalizada',
    colors: {
      background: '#002B5C', // Variante del fondo principal
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 43, 92, 0.8)', // Variante del fondo
      borderColor: '#003B73',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },

  SABIDURIA_DORADA: {
    id: 'SABIDURIA_DORADA',
    name: 'Sabiduría Dorada',
    description: 'Sabiduría Dorada con paleta CMYK personalizada',
    colors: {
      background: '#001F40', // Variante más oscura
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 31, 64, 0.8)', // Variante más oscura
      borderColor: '#002952',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  },

  ESENCIA_AZUL: {
    id: 'ESENCIA_AZUL',
    name: 'Esencia Azul',
    description: 'Esencia Azul con paleta CMYK personalizada',
    colors: {
      background: '#003D7A', // Variante más brillante
      text: '#F0E6D6', // Texto claro cálido consistente
      textSecondary: '#E0D0B8',
      accent: '#00A0FF', // Botón primario consistente
      accentSecondary: '#0050CC', // Botón secundario consistente
      navbarBg: '#1A1A4D', // Navbar consistente
      footerBg: '#1A1A4D', // Footer consistente
      buttonGradient: 'linear-gradient(135deg, #00A0FF 0%, #0050CC 100%)',
      cardBg: 'rgba(0, 61, 122, 0.8)', // Variante más brillante
      borderColor: '#0066CC',
      shadowColor: 'rgba(0, 160, 255, 0.2)'
    },
    typography: {
      headingFont: 'Playfair Display',
      bodyFont: 'Quicksand'
    }
  }
}

export const getTheme = (themeId: ThemeId): Theme => {
  return themes[themeId] || themes.CELESTIAL
}

export const getAllThemes = (): Theme[] => {
  return Object.values(themes)
}