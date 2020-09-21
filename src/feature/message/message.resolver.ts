import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { PubSub } from 'graphql-subscriptions';
import { FileInfo, MessageInput, MessageQuery } from './inputs/message.input';
import { MessageEntity } from './entity/message.entity';
import { ConversationService } from '../conversation/conversation.service';
import { GraphQLUpload } from 'apollo-server-express';
import { ReadStream } from 'fs-capacitor';
import { Public } from '../../share/decorator/public.decorator';
import {SubscribeMessage, MessageBody} from '@nestjs/websockets';
import GraphQLJSON from 'graphql-type-json';

const pubSub = new PubSub();

export interface FileUpload {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream(): ReadStream
  ;
}

@Resolver('Message')
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    ) {
  }

  @Query(returns => [MessageEntity])
  async findAllMessage(@Args('messageQuery') messageQuery: MessageQuery) {
    return this.messageService.findAllMessageByConversationId(messageQuery.conversationId, messageQuery.page, messageQuery.limit);
  }

  @Mutation(returns => MessageEntity)
  async newMessage(@Args('messageInput') messageInput: MessageInput) {
    const message = await this.messageService.addMessage(messageInput.conversationId, messageInput.senderId, messageInput.type, messageInput.message);
    pubSub.publish('messageAdded', { messageAdded: message });
    return message;
  }

  @Mutation(returns => Boolean)
  async removeMessage(@Args('messageId') messageId: string) {
    return this.messageService.removeMessage(messageId);
  }

  @Mutation(returns => MessageEntity)
  async uploadFile(@Args({name: 'file', type: () => GraphQLUpload!}) file: FileUpload, @Args('fileInfo') fileInfo: FileInfo) {
    const result = await this.messageService.uploadFile(file, fileInfo.conversationId, fileInfo.senderId, fileInfo.type);
    pubSub.publish('messageAdded', { messageAdded: result });
    return result;
  }

  @Query(returns => [MessageEntity])
  async getPhotos(@Args('messageQuery') messageQuery: MessageQuery) {
    return this.messageService.getPhotos(messageQuery.conversationId);
  }

  @Mutation(returns => Boolean)
  async startCall(@Args('data', {type: () => GraphQLJSON} ) data: any, @Args('userId') userId: string, @Args('peerId') peerId: string) {
    pubSub.publish('startCallUser', { startCallUser: {data, userId, peerId} });
    return true;
  }

  @Mutation(returns => Boolean)
  async acceptCall(@Args('data', {type: () => GraphQLJSON}) data: any) {
    pubSub.publish('acceptCallUser', { acceptCallUser: data });
    return true;
  }

  @Public()
  @Subscription(returns => MessageEntity, {
    name: 'messageAdded',
    filter: (payload, variables, context) => {
      const conversationIds = context.conversations.map(x => x._id);
      return conversationIds.includes(payload.messageAdded.conversationId);
    },
  })
  addMessageHandler() {
    return pubSub.asyncIterator('messageAdded');
  }

  @Public()
  @Subscription(returns => GraphQLJSON, {
    name: 'startCallUser',
    filter: (payload, variables, context) => {
      return context.currentUser.userId !== payload.startCallUser.userId;
    },
  })
  callUserHandler() {
    return pubSub.asyncIterator('startCallUser');
  }

  @Public()
  @Subscription(returns => GraphQLJSON, {
    name: 'acceptCallUser',
    filter: (payload, variables, context) => {
      return true;
    },
  })
  acceptCallHandler() {
    return pubSub.asyncIterator('acceptCallUser');
  }

  @SubscribeMessage('join room')
  handleEvent(
    @MessageBody() peerId: string,
    // @ConnectedSocket() client: Socket,
  ): string {
    console.log(peerId);
    return peerId;
  }

}
