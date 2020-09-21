import {
  MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

const rooms = {};

@WebSocketGateway()
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor() {
    const rooms = {};
  }
  @WebSocketServer() server: Server;
  private logger = new Logger('Events Gateway')
  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('join room')
  findAll(@MessageBody() roomID: any, client: Socket): Promise<unknown> {
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
    return roomID;
  }

  @SubscribeMessage('offer')
  offer(@MessageBody() payload: any, @ConnectedSocket() client: Socket,): Promise<unknown> {
    console.log(payload);
    client.to(payload.target).emit('offer', payload)
    return payload;
  }

  @SubscribeMessage('answer')
  answer(@MessageBody() payload: any, @ConnectedSocket() client: Socket,): Promise<unknown> {
    console.log(payload);
    client.to(payload.target).emit('answer', payload)
    return payload;
  }

  @SubscribeMessage('ice-candidate')
  iceCandidate(@MessageBody() incoming: any, @ConnectedSocket() client: Socket,): Promise<unknown> {
    console.log(incoming);
    client.to(incoming.target).emit('ice-candidate', incoming.candidate)
    return incoming;
  }

}
