import { Redis } from 'ioredis';

let redis: Redis | null = null;

try {
  // Solo intentar conectar si REDIS_URL está configurado
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // No reintentar
      lazyConnect: true
    });

    // Intentar conectar
    redis.connect().catch(() => {
      console.log('⚠️  Redis no disponible - funcionando sin caché');
      redis = null;
    });
  } else {
    console.log('ℹ️  Redis deshabilitado - funcionando sin caché');
  }
} catch (error) {
  console.log('⚠️  Redis no disponible - funcionando sin caché');
  redis = null;
}

// Wrapper seguro para operaciones de Redis
export const cache = {
  async get(key: string): Promise<string | null> {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!redis) return false;
    try {
      if (ttl) {
        await redis.setex(key, ttl, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch {
      return false;
    }
  },

  async del(key: string): Promise<boolean> {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch {
      return false;
    }
  },

  async keys(pattern: string): Promise<string[]> {
    if (!redis) return [];
    try {
      return await redis.keys(pattern);
    } catch {
      return [];
    }
  }
};

export { redis };
