export interface ThemeColors {
  background: string
  text: string
  textSecondary: string
  accent: string
  accentSecondary: string
  navbarBg: string
  footerBg: string
  buttonGradient: string
  cardBg: string
  borderColor: string
  shadowColor: string
}

export interface Theme {
  id: string
  name: string
  description: string
  colors: ThemeColors
  typography: {
    headingFont: string
    bodyFont: string
  }
}

export type ThemeId = 
  | 'CELESTIAL'
  | 'AURORA' 
  | 'ARCANGELES'
  | 'MINIMAL'
  | 'LUZ_DIVINA'
  | 'SABIDURIA_DORADA'
  | 'ESENCIA_AZUL'

export interface ThemeContextType {
  currentTheme: Theme
  themeId: ThemeId
  setTheme: (themeId: ThemeId) => void
  applyTheme: (themeId: ThemeId) => Promise<void>
  isLoading: boolean
}