import { Module } from '@nestjs/common';
import { ConversationResolver } from './conversation.resolver';
import { ConversationService } from './conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationEntity } from './entity/conversation.entity';
import { ParticipantEntity } from '../participant/entity/participant.entity';
import { ParticipantService } from '../participant/participant.service';
import { MessageEntity} from '../message/entity/message.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ConversationEntity, ParticipantEntity, MessageEntity])],
  providers: [ConversationResolver, ParticipantService, ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
