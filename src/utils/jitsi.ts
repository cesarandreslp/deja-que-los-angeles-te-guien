// Utilidad para generar enlaces de videollamada con Jitsi Meet
export function generateJitsiMeetingLink(consultationId: string): string {
  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si'
  const roomName = `oraculo-consulta-${consultationId}`
  return `https://${jitsiDomain}/${roomName}`
}

// Generar nombre de sala única para la consulta
export function generateRoomName(consultationId: string): string {
  return `oraculo-consulta-${consultationId}`
}

// Validar si un enlace de Jitsi es válido
export function isValidJitsiLink(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes('jit.si') || urlObj.hostname.includes('meet.jit')
  } catch {
    return false
  }
}

// Extraer room name de un enlace de Jitsi
export function extractRoomNameFromLink(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0)
    return pathSegments[0] || null
  } catch {
    return null
  }
}