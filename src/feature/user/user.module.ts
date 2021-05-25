import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';
import { EventsModule } from '../events/events.module';
import { ConversationModule } from '../conversation/conversation.module';
import { RedisCacheModule } from '../cache/redisCache.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), RedisCacheModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
