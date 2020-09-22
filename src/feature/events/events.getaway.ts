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
import { UserEntity } from '../user/entity/user.entity';

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
    console.log(user);
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join room')
  findAll(client: Socket, roomID: any): Promise<unknown> {
    if (rooms[roomID]) {
      rooms[roomID].push(client.id);
    } else {
      rooms[roomID] = [client.id];
    }
    const otherUser = rooms[roomID].find(id => id !== client.id);
    if (otherUser) {
      client.emit('other user', otherUser);
      client.to(otherUser).emit('user joined', client.id);
    }
    client.emit('roomId', roomID);
    return roomID;
  }

  @SubscribeMessage('offer')
  offer(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    console.log(payload);
    client.to(payload.target).emit('offer', payload)
    return payload;
  }

  @SubscribeMessage('answer')
  answer(@MessageBody() payload: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    console.log(payload);
    client.to(payload.target).emit('answer', payload)
    return payload;
  }

  @SubscribeMessage('ice-candidate')
  iceCandidate(@MessageBody() incoming: any, @ConnectedSocket() client: Socket): Promise<unknown> {
    console.log(incoming);
    client.to(incoming.target).emit('ice-candidate', incoming.candidate)
    return incoming;
  }

}
