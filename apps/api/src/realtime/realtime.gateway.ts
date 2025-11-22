import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class RealtimeGateway {
  @WebSocketServer()
  server!: Server;

  emitOrderCreated(order: Order) {
    this.server.emit('order_created', order);
  }

  emitOrderUpdated(order: Order) {
    this.server.emit('order_updated', order);
  }

  emitOrderReady(order: Order) {
    this.server.emit('order_ready', order);
  }

  emitOrderCancelled(order: Order) {
    this.server.emit('order_cancelled', order);
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() message: string) {
    return { event: 'pong', data: message };
  }
}
