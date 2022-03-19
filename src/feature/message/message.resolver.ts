import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { PubSub } from 'graphql-subscriptions';
import { FileInfo, MessageInput, MessageQuery } from './inputs/message.input';
import { MessageEntity, MessageType } from './entity/message.entity';
import { ConversationService } from '../conversation/conversation.service';
import { GraphQLUpload } from 'apollo-server-express';
import { ReadStream } from 'fs-capacitor';
import { Socket } from 'socket.io';
import { EventsGateway } from '../events/events.getaway';

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
    private readonly eventGateway: EventsGateway,
  ) {}

  @Query((returns) => [MessageEntity])
  async findAllMessage(@Args('messageQuery') messageQuery: MessageQuery) {
    console.log(messageQuery)
    return this.messageService.findMessage(
      messageQuery.conversationId,
      messageQuery.page,
      messageQuery.limit,
    );
  }

  @Query((returns) => [MessageEntity])
  async getPhotos(@Args('messageQuery') messageQuery: MessageQuery) {
    return this.messageService.getPhotos(messageQuery.conversationId);
  }

  @Query((returns) => [MessageEntity])
  async searchMessage(@Args('messageQuery') messageQuery: MessageQuery) {
    return this.messageService.searchMessage(
      messageQuery.conversationId,
      messageQuery.searchText,
    );
  }

  @Query((returns) => [MessageEntity])
  async searchRecentMessage(@Args('messageId') messageId: string) {
    return this.messageService.searchRecentMessage(messageId);
  }

  @Mutation((returns) => MessageEntity)
  async newMessage(
    @Args('messageInput') messageInput: MessageInput,
    client: Socket,
  ) {
    const message = await this.messageService.addMessage(
      messageInput.conversationId,
      messageInput.senderId,
      messageInput.type,
      messageInput.message,
    );
    this.eventGateway.server
      .in(message.conversationId)
      .emit('newMessage', message);
    return message;
  }

  @Mutation((returns) => Boolean)
  async removeMessage(@Args('messageId') messageId: string, @Args('conversationId') conversationId: string) {
    const message = await this.messageService.removeMessage(messageId);
    if (message) {
      this.eventGateway.server.in(conversationId).emit('removeMessage', messageId);
      return message
    }
    return false;
  }

  @Mutation((returns) => MessageEntity)
  async uploadFile(
    @Args({ name: 'file', type: () => GraphQLUpload! }) file: FileUpload,
    @Args('fileInfo') fileInfo: FileInfo,
  ) {
    const result = ((await this.messageService.uploadFile(
      file,
      fileInfo.conversationId,
      fileInfo.senderId,
      fileInfo.type,
    )) as unknown) as MessageEntity;
    this.eventGateway.server
      .in(result.conversationId)
      .emit('newMessage', result);
    return result;
  }

  @Mutation((returns) => Boolean)
  async deleteMessage(@Args('messageid') messageId: string) {
    return this.messageService.deleteMessage(messageId);
  }
}
