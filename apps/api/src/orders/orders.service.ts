import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Channel, OrderStatus, Prisma } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private realtime: RealtimeGateway) {}

  async createOrder(data: Prisma.OrderCreateInput) {
    const order = await this.prisma.order.create({ data, include: { items: { include: { extras: true, product: true } } } });
    this.realtime.emitOrderCreated(order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.update({ where: { id }, data: { status } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (status === OrderStatus.READY) {
      this.realtime.emitOrderReady(order);
    } else if (status === OrderStatus.CANCELLED) {
      this.realtime.emitOrderCancelled(order);
    } else {
      this.realtime.emitOrderUpdated(order);
    }
    return order;
  }

  listByStatus(status?: OrderStatus, channel?: Channel) {
    return this.prisma.order.findMany({
      where: {
        status: status ?? undefined,
        channel: channel ?? undefined
      },
      include: { items: { include: { extras: true, product: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  getById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { extras: true, product: true } } }
    });
  }
}
