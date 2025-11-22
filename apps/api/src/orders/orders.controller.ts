import { Body, Controller, Get, Param, Post, Query, UseGuards, Patch } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Channel, OrderStatus } from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

class OrderItemExtraDto {
  @IsString()
  extraId!: string;

  @IsInt()
  price!: number;
}

class OrderItemDto {
  @IsString()
  productId!: string;

  @IsInt()
  qty!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsInt()
  unitPrice!: number;

  @IsOptional()
  extras?: OrderItemExtraDto[];
}

class CreateOrderDto {
  @IsEnum(Channel)
  channel!: Channel;

  @IsArray()
  items!: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post()
  @Roles(Role.CASHIER, Role.ADMIN, Role.MANAGER)
  createOrder(@Body() body: CreateOrderDto) {
    const total = body.items.reduce((sum, item) => {
      const extrasTotal = item.extras?.reduce((acc, extra) => acc + extra.price, 0) ?? 0;
      return sum + item.unitPrice * item.qty + extrasTotal;
    }, 0);
    return this.orders.createOrder({
      channel: body.channel,
      status: OrderStatus.PENDING,
      total,
      notes: body.notes,
      items: {
        create: body.items.map((item) => ({
          product: { connect: { id: item.productId } },
          qty: item.qty,
          notes: item.notes,
          unitPrice: item.unitPrice,
          isCombo: false,
          extras: item.extras
            ? {
                create: item.extras.map((extra) => ({
                  extra: { connect: { id: extra.extraId } },
                  price: extra.price
                }))
              }
            : undefined
        }))
      }
    });
  }

  @Patch(':id/status')
  @Roles(Role.KITCHEN, Role.MANAGER, Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: UpdateStatusDto) {
    return this.orders.updateStatus(id, body.status);
  }

  @Get()
  list(@Query('status') status?: OrderStatus, @Query('channel') channel?: Channel) {
    return this.orders.listByStatus(status, channel);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.orders.getById(id);
  }
}
