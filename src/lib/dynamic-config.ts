// Configuración dinámica para NextAuth
export function getNextAuthUrl() {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // En el servidor, intentar detectar desde variables de entorno
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Para desarrollo local, usar puerto por defecto
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}`;
}

// Función helper para actualizar variables de entorno en tiempo de ejecución
export function updateEnvForPort(port: number) {
  if (process.env.NODE_ENV === 'development') {
    process.env.NEXTAUTH_URL = `http://localhost:${port}`;
  }
}