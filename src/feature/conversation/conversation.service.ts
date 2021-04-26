import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from './entity/conversation.entity';
import { MongoRepository } from 'typeorm';
import _ from 'lodash';
import { ParticipantEntity, ParticipantType } from '../participant/entity/participant.entity';
import { RoomEntity } from './entity/room.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: MongoRepository<ConversationEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepo: MongoRepository<RoomEntity>,
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
        $lookup: {
          from: 'user',
          localField: 'userId',
          foreignField: '_id',
          as: 'participants',
        },
      },
      {
        $project: {
          _id: '$conversation._id',
          title: '$conversation.title',
          updatedAt: '$conversation.updatedAt',
          participants: '$participants',
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

  async createConversation(creatorId: string, participantMembers: string[], type, title = '') {
    if (type === ParticipantType.single) {
      const conversationParticipant = await this.participantRepo.findOne({
        where: {
          userId: participantMembers
        }
      })
      if (conversationParticipant) {
        return this.conversationRepo.findOne({_id: conversationParticipant.conversationId});
      }
      console.log(conversationParticipant);
      return '';
    }
    console.log(type);
    
    const conversation = await this.conversationRepo.save(new ConversationEntity({title, creatorId, type}));
    const participant = await this.participantRepo.save(new ParticipantEntity({conversationId: conversation._id, userId: [...participantMembers, creatorId], type}));
    return conversation;
  }

  async deleteConversation(conversationId: string) {
    const conversation = await this.conversationRepo.findOne({_id: conversationId});
    if (!conversation) {
      throw new BadRequestException('Conversation not found!');
    }
    return !!(await this.conversationRepo.remove(conversation));
  }

  async createRoom(peerId: string, creatorId: string) {
    return this.roomRepo.save(new RoomEntity({
      peerId,
      creatorId,
      participants: [creatorId],
    }))
  }

  async findRoomByPeerId(peerId: string) {
    return this.roomRepo.findOneOrFail({ peerId });
  }

}
