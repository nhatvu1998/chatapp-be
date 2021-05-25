import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { CacheConfigService } from 'src/share/module/config/caching';
import { ConfigModule } from 'src/share/module/config/config.module';
import { RedisCacheService } from './redisCache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useClass: CacheConfigService,
    })
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
