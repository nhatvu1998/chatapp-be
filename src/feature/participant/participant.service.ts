import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantEntity } from './entity/participant.entity';
import { Repository } from 'typeorm';
import { ConversationEntity } from '../conversation/entity/conversation.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(ParticipantEntity)
    private readonly participantRepo: Repository<ParticipantEntity>
  ) {}

  async addParticipant(conversationId: string, type: number, userId: string[]) {
    const participant = new ParticipantEntity({conversationId, type, userId});
    return this.participantRepo.save(participant);
  }
}
