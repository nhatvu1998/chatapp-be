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

const rooms = {};

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly userService: UserService,
  ) {}

  @WebSocketServer() server: Server;
  private logger = new Logger('Events Gateway')

  async handleConnection(socket) {
    const user = await this.userService.decodeToken(socket.handshake.query.token)
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage('call signal')
  // callSignal(@MessageBody() roomId: any, @ConnectedSocket() client: Socket): Promise<unknown> {
  //   const otherUser = rooms[roomId].find(id => id !== client.id);
  //   if (otherUser) {
  //     client.emit('other user', otherUser);
  //     client.to(otherUser).emit('user joined', client.id);
  //   }
  // }

  @SubscribeMessage('join room')
  findAll(client: Socket, roomId: any): Promise<unknown> {
    if (rooms[roomId]) {
      rooms[roomId].push(client.id);
    } else {
      rooms[roomId] = [client.id];
    }
    const otherUser = rooms[roomId].find(id => id !== client.id);
    if (otherUser) {
      client.emit('other user', otherUser);
      client.to(otherUser).emit('user joined', client.id);
    }
    console.log(roomId);
    client.emit('roomId', roomId);
    return roomId;
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
