'use client'

import { useEffect, useState } from 'react'

interface FloatingParticle {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
  animation: 'float' | 'drift' | 'cascade'
}

interface FallingParticle {
  id: number
  left: string
  delay: number
  duration: number
}

// Función para generar números pseudo-aleatorios consistentes
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function GoldenStarsBackground() {
  const [isClient, setIsClient] = useState(false)
  const [floatingParticles, setFloatingParticles] = useState<FloatingParticle[]>([])
  const [fallingParticles, setFallingParticles] = useState<FallingParticle[]>([])

  useEffect(() => {
    setIsClient(true)
    
    // Generar partículas flotantes circulares con seed fijo
    const generateFloatingParticles = () => {
      const newParticles: FloatingParticle[] = []
      const particleCount = 20

      for (let i = 0; i < particleCount; i++) {
        const seed = i * 42 // Seed fijo basado en el índice
        newParticles.push({
          id: i,
          left: `${seededRandom(seed) * 100}%`,
          top: `${seededRandom(seed + 1) * 100}%`,
          size: seededRandom(seed + 2) * 4 + 2, // 2-6px
          delay: seededRandom(seed + 3) * 6,
          duration: seededRandom(seed + 4) * 4 + 4, // 4-8s
          animation: seededRandom(seed + 5) > 0.5 ? 'float' : 'drift'
        })
      }

      setFloatingParticles(newParticles)
    }

    // Generar partículas que caen desde arriba con seed fijo
    const generateFallingParticles = () => {
      const newParticles: FallingParticle[] = []
      const particleCount = 15

      for (let i = 0; i < particleCount; i++) {
        const seed = i * 73 + 100 // Seed diferente para partículas que caen
        newParticles.push({
          id: i,
          left: `${seededRandom(seed) * 100}%`,
          delay: seededRandom(seed + 1) * 8,
          duration: seededRandom(seed + 2) * 4 + 6 // 6-10s
        })
      }

      setFallingParticles(newParticles)
    }

    generateFloatingParticles()
    generateFallingParticles()

    // Regenerar partículas periódicamente
    const floatingInterval = setInterval(() => {
      generateFloatingParticles()
    }, 10000)

    const fallingInterval = setInterval(() => {
      generateFallingParticles()
    }, 12000)

    return () => {
      clearInterval(floatingInterval)
      clearInterval(fallingInterval)
    }
  }, [])

  // No renderizar nada hasta que estemos en el cliente
  if (!isClient) return null

  return (
    <div className="particles-background" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      pointerEvents: 'none', 
      zIndex: 0,
      overflow: 'hidden' 
    }}>
      {/* Partículas flotantes circulares */}
      {floatingParticles.map((particle) => (
        <div
          key={`floating-${particle.id}`}
          className={`circular-particle particle-${particle.animation}`}
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            position: 'absolute',
            zIndex: 0
          }}
        />
      ))}

      {/* Partículas que caen desde arriba */}
      {fallingParticles.map((particle) => (
        <div
          key={`falling-${particle.id}`}
          className="circular-particle particle-cascade"
          style={{
            left: particle.left,
            top: '-10px',
            width: '3px',
            height: '3px',
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            position: 'absolute',
            zIndex: 0
          }}
        />
      ))}

      {/* Algunas partículas adicionales para más densidad */}
      {[...Array(8)].map((_, i) => {
        const seed = i * 137 + 200 // Seed fijo para partículas extra
        return (
          <div
            key={`extra-${i}`}
            className="circular-particle particle-float"
            style={{
              left: `${seededRandom(seed) * 100}%`,
              top: `${seededRandom(seed + 1) * 100}%`,
              width: `${seededRandom(seed + 2) * 3 + 2}px`,
              height: `${seededRandom(seed + 3) * 3 + 2}px`,
              animationDelay: `${seededRandom(seed + 4) * 8}s`,
              animationDuration: `${seededRandom(seed + 5) * 6 + 4}s`,
              position: 'absolute',
              zIndex: 0
            }}
          />
        )
      })}
    </div>
  )
}