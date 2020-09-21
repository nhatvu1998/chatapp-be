import { Module } from '@nestjs/common';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entity/message.entity';
import { ConversationEntity } from '../conversation/entity/conversation.entity';
import { ConversationModule } from '../conversation/conversation.module';
import { ParticipantModule } from '../participant/participant.module';
import { ConversationService } from '../conversation/conversation.service';
import { ParticipantService } from '../participant/participant.service';
import { ParticipantEntity } from '../participant/entity/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity, ConversationEntity, ParticipantEntity])],
  providers: [MessageResolver, MessageService, ConversationService, ParticipantService],
})
export class MessageModule {}
