import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.user.findMany();
  }

  create(data: { name: string; pin: string; role: Role }) {
    return this.prisma.user.create({ data });
  }
}
