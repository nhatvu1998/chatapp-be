import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key): Promise<any> {
    return await this.cache.get(key);
  }

  async getMany(keys: string[]): Promise<any[]> {
    return await this.cache.mget(keys);
  }

  async set(key, value) {
    await this.cache.set(key, value);
  }
  
  async del(key: any) {
    await this.cache.del(key);
  }
}
