import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entity/conversation.entity';
import { MongoRepository } from 'typeorm';
import { ParticipantEntity, ParticipantType } from '../participant/entity/participant.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: MongoRepository<ConversationEntity>,
    @InjectRepository(ParticipantEntity)
    private readonly participantRepo: MongoRepository<ParticipantEntity>,
  ) {}

  async getManyConversation(userId: string) {
    const conversations = await this.participantRepo.aggregate([
      {
        $match: {
          userId: {$in: [userId]},
        },
      },
      {
        $lookup: {
          from: 'conversation',
          localField: 'conversationId',
          foreignField: '_id',
          as: 'conversation',
        },
      },
      {
        $unwind: {
          path: '$conversation',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'message',
          localField: 'conversationId',
          foreignField: 'conversationId',
          as: 'firstMessage',
        },
      },
      {
        $project: {
          _id: '$conversation._id',
          title: '$conversation.title',
          updatedAt: '$conversation.updatedAt',
          firstMessage: { $arrayElemAt: [ '$firstMessage', -1 ] },
          senderid: { $arrayElemAt: [ '$firstMessage.senderId', -1 ] },
          type: '$type',
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
    ]).toArray();
    return conversations;
  }

  // async getParticipant(conversationId: string) {
  //   return this.participantRepo.find({conversationId});
  // }

  async createConversation(title: string, creatorId: string, participantMembers: string[], type: ParticipantType) {
    const conversation = await this.conversationRepo.save(new ConversationEntity({title, creatorId}));
    const participant = await this.participantRepo.save(new ParticipantEntity({conversationId: conversation._id, userId: participantMembers, type}));
    return conversation;
  }

}
