import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity, MessageType } from './entity/message.entity';
import { MongoRepository, LessThan } from 'typeorm';
import { ConversationEntity } from '../conversation/entity/conversation.entity';
import { join } from 'path';
import { Storage } from '@google-cloud/storage';
import { EventsGateway } from '../events/events.getaway';
import { ConfigService } from '../../share/module/config/config.service';
const serviceKey = join(__dirname, '../../../keys.json')
import AWS from 'aws-sdk';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: MongoRepository<MessageEntity>,
    @InjectRepository(ConversationEntity)
    private readonly convesationRepo: MongoRepository<ConversationEntity>,
    private readonly eventGateway: EventsGateway,
    private configService: ConfigService,
  ) {}

  getFileBucket() {
    const storage = new Storage({
      keyFilename: serviceKey,
      projectId: this.configService.get('GCLOUD_PROJECT_ID'),
    })
    const bucketName = this.configService.get('BUCKET_NAME');
    const fileBucket = storage.bucket(bucketName)
    return fileBucket
    // let s3bucket = new AWS.S3({
    //   accessKeyId: meisai.config.aws_access_key_id,
    //   secretAccessKey: meisai.config.aws_secret_access_key,
    //   region: meisai.config.aws_region,
    // })
  }

  async findMessage(conversationId: string, page= 1, limit= 20) {
    const message = await this.messageRepo.find({
      where: {
        conversationId,
        isDeleted: { $nin: [ true ] },
      },
      order: {createdAt: -1},
      take: limit,
      skip: limit * (page - 1),
    });
    console.log({message});
    return message
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
    conversation.updatedAt = +new Date();
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
    const { createReadStream, filename, mimetype, encoding } = await file;
    let filetype;
    switch(mimetype.split('/')[0]) {
      case 'image':
        filetype = 1
        break;
      case 'audio':
        filetype = 2
        break;
      case 'video':
        filetype = 3
        break;
      case 'application':
        filetype = 4
        break;
      default:
        break
    }
    console.log(filetype);
      await new Promise(res =>
          createReadStream()
            .pipe(
              this.getFileBucket().file(filename).createWriteStream({
                resumable: false,
                gzip: true
              })
            )
            .on('finish', async () => {
              const uploadResult = (await this.getFileBucket().file(filename).getMetadata())[0];
              console.log(uploadResult)
              const fileInfo = {
                key: uploadResult.id,
                name: uploadResult.name,
                url: `https://storage.cloud.google.com/${uploadResult.bucket}/${uploadResult.name}?authuser=1`,
              };
              const result = await this.messageRepo.save(new MessageEntity({conversationId, senderId, type: filetype, message, files: fileInfo}))
              this.eventGateway.server.in(result.conversationId).emit('newMessage', result)
            })
            .on('error', err => console.log(err))
      )
  }

  async getPhotos(conversationId: string, page= 1, limit= 20) {
    return this.messageRepo.find({
      where: {
        conversationId,
        type: {$in: [MessageType.image, MessageType.video]},
      },
      order: {createdAt: -1},
      take: limit,
      skip: limit * (page - 1),
    });
  }

  async searchMessage(conversationId: string, searchText: string) {
    return this.messageRepo.find({
      where: {
        conversationId,
        message: { $regex: searchText },
      },
      order: {createdAt: -1},
    });
  }

  async searchRecentMessage(messageId: string, limit = 10) {
    const message = await this.messageRepo.findOne({ _id: messageId });
    console.log(message);
    if (!message) {
      throw new NotFoundException('Message not Found!')
    }
    const a = await this.messageRepo.find({
      where: {
        $or: [
          { createdAt: { $lt: message.createdAt } },
          { createdAt: { $gte: message.createdAt } },
        ],
      },
      take: limit * 2,
      order: { createdAt: -1 },
    });
    console.log(a);
    
    // const a = await this.messageRepo.aggregate([

    // ])
    return a;
    // return this.messageRepo.find({
    //   where: {
    //     _id: messageId,
    //   },
    //   order: {createdAt: -1},
    // });
  }

  async deleteMessage(messageId:string) {
    await this.messageRepo.findOneAndUpdate(
      { _id: messageId },
      {
        $set: {
          'isDeleted': true
        }
      }
    )
    return true;
  }
}
