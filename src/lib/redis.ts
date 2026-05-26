import { Redis } from 'ioredis';

let redisClient: Redis | null = null;

try {
  // Solo intentar conectar si REDIS_URL está configurado
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // No reintentar
      lazyConnect: true
    });

    // Intentar conectar
    redisClient.connect().catch(() => {
      console.log('⚠️  Redis no disponible - funcionando sin caché');
      redisClient = null;
    });
  } else {
    console.log('ℹ️  Redis deshabilitado - funcionando sin caché');
  }
} catch (error) {
  console.log('⚠️  Redis no disponible - funcionando sin caché');
  redisClient = null;
}

// Wrapper seguro que simula Redis cuando no está disponible
class RedisProxy {
  constructor(private client: Redis | null) {}

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<any> {
    if (!this.client) return 'OK';
    try {
      return await this.client.set(key, value);
    } catch {
      return 'OK';
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<any> {
    if (!this.client) return 'OK';
    try {
      return await this.client.setex(key, ttl, value);
    } catch {
      return 'OK';
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.del(key);
    } catch {
      return 0;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.client) return 1;
    try {
      return await this.client.incr(key);
    } catch {
      return 1;
    }
  }

  async expire(key: string, ttl: number): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.expire(key, ttl);
    } catch {
      return 0;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.sadd(key, ...members);
    } catch {
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.client) return [];
    try {
      return await this.client.smembers(key);
    } catch {
      return [];
    }
  }

  async keys(pattern: string): Promise<string[]> {
    if (!this.client) return [];
    try {
      return await this.client.keys(pattern);
    } catch {
      return [];
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    if (!this.client) return 0;
    try {
      return await this.client.publish(channel, message);
    } catch {
      return 0;
    }
  }

  async connect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.connect();
      } catch {
        // Ignorar errores de conexión
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {
        // Ignorar errores de desconexión
      }
    }
  }
}

// Exportar proxy que es seguro incluso sin Redis
export const redis = new RedisProxy(redisClient);

// Wrapper para caché
export const cache = {
  async get(key: string): Promise<string | null> {
    return redis.get(key);
  },

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
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
    try {
      await redis.del(key);
      return true;
    } catch {
      return false;
    }
  },

  async keys(pattern: string): Promise<string[]> {
    return redis.keys(pattern);
  }
};

export { redisClient };
