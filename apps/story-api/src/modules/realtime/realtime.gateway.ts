import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/events',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  private readonly connectedClients = new Map<string, Socket>();

  handleConnection(client: Socket): void {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', { clientId: client.id, timestamp: new Date().toISOString() });
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { channel: string }): void {
    if (data?.channel) {
      client.join(data.channel);
      client.emit('subscribed', { channel: data.channel });
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket, @MessageBody() data: { channel: string }): void {
    if (data?.channel) {
      client.leave(data.channel);
    }
  }

  emitToChannel(channel: string, event: string, data: unknown): void {
    this.server?.to(channel).emit(event, data);
  }

  emitToAll(event: string, data: unknown): void {
    this.server?.emit(event, data);
  }

  sendProgress(clientId: string, event: string, data: { progress: number; message: string }): void {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, data);
    }
  }
}
