/**
 * Sistema de caché en memoria simple para mejorar el rendimiento
 * Reduce consultas repetitivas a la base de datos
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 60 * 1000; // 1 minuto por defecto

  /**
   * Obtener un valor del caché
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Verificar si ha expirado
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Guardar un valor en el caché
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const ttl = ttlMs || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    this.cache.set(key, entry);
  }

  /**
   * Invalidar una clave específica
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidar múltiples claves que coincidan con un patrón
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Obtener o ejecutar (caché con fallback)
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>,
    ttlMs?: number
  ): Promise<T> {
    // Intentar obtener del caché
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Si no está en caché, ejecutar el fetcher
    const data = await fetcher();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    this.cache.forEach((entry) => {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    });

    return {
      total: this.cache.size,
      active,
      expired
    };
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanExpired(): number {
    const now = Date.now();
    let cleaned = 0;
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      cleaned++;
    });

    return cleaned;
  }
}

// Instancia global del caché
export const cache = new MemoryCache();

// Limpiar caché expirado cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = cache.cleanExpired();
    if (cleaned > 0) {
      console.log(`🧹 Limpieza de caché: ${cleaned} entradas expiradas eliminadas`);
    }
  }, 5 * 60 * 1000);
}

/**
 * Decorador para funciones con caché automático
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator: (...args: Parameters<T>) => string;
    ttl?: number;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyGenerator(...args);
    return cache.getOrSet(key, () => fn(...args), options.ttl);
  }) as T;
}

/**
 * Funciones helper para cachear queries comunes
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userMentor: (userId: string) => `user:${userId}:mentor`,
  userStats: (userId: string) => `user:${userId}:stats`,
  cards: () => `cards:all`,
  archangels: () => `archangels:all`,
  storeConfig: () => `store:config`,
  product: (productId: string) => `product:${productId}`,
  products: (filters: string) => `products:${filters}`,
  blogPost: (slug: string) => `blog:post:${slug}`,
  blogPosts: (filters: string) => `blog:posts:${filters}`,
  consultation: (id: string) => `consultation:${id}`,
};

/**
 * TTL predefinidos
 */
export const cacheTTL = {
  short: 30 * 1000,        // 30 segundos
  medium: 60 * 1000,       // 1 minuto
  long: 5 * 60 * 1000,     // 5 minutos
  veryLong: 15 * 60 * 1000 // 15 minutos
};
