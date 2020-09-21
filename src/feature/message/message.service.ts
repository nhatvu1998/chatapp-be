import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, MessageType } from './entity/message.entity';
import { MongoRepository } from 'typeorm';
import { ConversationEntity } from '../conversation/entity/conversation.entity';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { S3 } from 'aws-sdk';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: MongoRepository<MessageEntity>,
    @InjectRepository(ConversationEntity)
    private readonly convesationRepo: MongoRepository<ConversationEntity>,
  ) {}

  async findAllMessageByConversationId(conversationId: string, page= 1, limit= 50) {
    return this.messageRepo.find({
      where: {
        conversationId,
      },
      order: {createdAt: -1},
      take: limit,
      skip: limit * (page - 1),
    });
  }

  async addMessage(conversationId: string, senderId: string, type: MessageType, message: string) {
    const conversationArr = await this.convesationRepo.aggregate([
      {
        $match: {
          _id: conversationId,
        },
      },
      {
        $lookup: {
          from: 'participant',
          localField: '_id',
          foreignField: 'conversationId',
          as: 'participants',
        },
      },
      {
        $unwind: {
          path: '$participants',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).toArray();
    const conversation = conversationArr.shift();

    if (!conversation) {
      throw new UnauthorizedException('Conversation not found!');
    }

    if (!conversation.participants.userId.includes(senderId)) {
      throw new UnauthorizedException('You cannot send message in this conversation!');
    }
    conversation.updatedAt = new Date();
    await this.convesationRepo.save(conversation);
    return await this.messageRepo.save(new MessageEntity({ conversationId, senderId, type, message }));
  }

  async removeMessage(messageId: string) {
    const message = await this.messageRepo.findOne({_id: messageId});
    if (!message) {
      throw new BadRequestException('Message not found!');
    }
    return !!(await this.messageRepo.deleteOne(message));
  }

  async uploadFile(file: any, conversationId, senderId, type, message = '') {
    let uploadResult;
    const s3 = this.getS3();
    const { createReadStream, filename, mimetype, encoding } = await file;
    if (file) {
      uploadResult = await s3.upload({
        Bucket: 'chatapp-vu',
        Key: `${uuid()}${extname(filename)}`,
        ContentType: mimetype,
        Body: createReadStream(),
        ACL: 'public-read',
      }).promise();
    }
    console.log(uploadResult);
    const fileInfo = {
      key: uploadResult.key,
      name: filename,
      url: uploadResult.Location,
    };
    if (mimetype.includes('mp4')) {
      type = 3;
    }
    const newMessage = await this.messageRepo.save(new MessageEntity({conversationId, senderId, type, message, files: fileInfo}))
    console.log(newMessage);
    return newMessage;
  }
  getS3() {
    return new S3({
      accessKeyId: 'AKIAIKKJ4C4SRTCL47EA',
      secretAccessKey: '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',
    });
  }

  async getPhotos(conversationId: string, page= 1, limit= 20) {
    return this.messageRepo.find({
      where: {
        conversationId,
        type: MessageType.image,
      },
      order: {createdAt: -1},
      take: limit,
      skip: limit * (page - 1),
    });
  }
}
