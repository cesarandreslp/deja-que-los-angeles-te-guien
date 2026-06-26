'use client'

// DESHABILITADO - ConfigProvider antiguo comentado para evitar conflictos con nuevo sistema de temas
// import ConfigProvider from '@/providers/ConfigProvider'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* <ConfigProvider> */}
      {children}
      {/* </ConfigProvider> */}
    </>
  )
}