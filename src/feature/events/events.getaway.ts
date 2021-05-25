import {
  MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket
} from '@nestjs/websockets';
import { Client, Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConversationService } from '../conversation/conversation.service';
import { getMongoRepository } from 'typeorm';
import { RoomEntity } from '../conversation/entity/room.entity';

const rooms = {};

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
    private readonly conversationService: ConversationService,
  ) {}

  @WebSocketServer() server: Server;
  private logger = new Logger('Events Gateway')

  async handleConnection(socket) {
    const user = await this.userService.decodeToken(socket.handshake.query.token)
    const conversations = (await this.conversationService.getManyConversation(user.userId));
    conversations.map(conversation => {
      socket.join(conversation._id);
    })
    this.logger.log(`Client connected: ${user.userId}`);
  }

  async handleDisconnect(socket) {
    const user = await this.userService.decodeToken(socket.handshake.query.token)
    const conversations = await this.conversationService.getManyConversation(user.userId);
    conversations.map(conversation => {
      socket.leave(conversation._id);
    })
    this.logger.log(`Client disconnected: ${user.userId}`);
  }

  @SubscribeMessage('join room')
  async findAll(client: Socket, roomId: any): Promise<unknown> {
    if (rooms[roomId]) {
      rooms[roomId].push(client.id);
    } else {
      rooms[roomId] = [client.id];
    }
    const otherUser = rooms[roomId].find((id) => id !== client.id);
    if (otherUser) {
      client.emit('other user', otherUser);
      client.to(otherUser).emit('user joined', client.id);
    }
    return roomId;
    // let room = await this.conversationService.findRoomByPeerId(payload.peerId);
    // const user = await this.userService.decodeToken(client.handshake.query.token)
    // if (!room) {
    //   room = await this.conversationService.createRoom(payload.peerId, payload.creatorId)
    // }
    // room.participants.push(user?._id);
    // await getMongoRepository(RoomEntity).save(room);
    // const otherUser = room.participants.find(id => id !== user?._id);
    // if (otherUser) {
    //   client.emit('other user', otherUser);
    //   client.to(otherUser).emit('user joined', client.id);
    // }
    // return payload;
  }

  @SubscribeMessage('call-signal')
  async callSignal(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    console.log(payload);
    const user = await this.userService.decodeToken(client.handshake.query.token)
    client.in(payload.roomId).emit('peerId', {peerId: payload.peerId, userId: user.userId})
    // client.to(payload.roomId).emit('peerId', {peerId: payload.peerId, userId: user.userId})
    return payload;
  }

  @SubscribeMessage('offer')
  offer(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    client.to(payload.target).emit('offer', payload)
    return payload;
  }

  @SubscribeMessage('answer')
  answer(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    client.to(payload.target).emit('answer', payload)
    return payload;
  }

  @SubscribeMessage('ice-candidate')
  iceCandidate(@MessageBody() incoming: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    client.to(incoming.target).emit('ice-candidate', incoming.candidate)
    return incoming;
  }
}
