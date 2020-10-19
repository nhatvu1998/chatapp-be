import { Module } from '@nestjs/common';
import { EventsGateway } from './events.getaway';
import { UserModule } from '../user/user.module';
import { ConversationModule } from '../conversation/conversation.module';
import { MessageModule } from '../message/message.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from '../conversation/entity/room.entity';

@Module({
  imports: [UserModule, ConversationModule],
  providers: [EventsGateway],
  exports: [EventsGateway]
})
export class EventsModule {}
