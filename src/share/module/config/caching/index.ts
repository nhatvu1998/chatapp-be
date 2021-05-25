import { CacheModuleOptions, CacheOptionsFactory, Injectable } from "@nestjs/common";
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '../config.service';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private configService: ConfigService) {}
  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: redisStore,
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      ttl: 120, // seconds
      max: 10, // maximum number of items in cache
    };
  }
}
