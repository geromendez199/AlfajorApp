import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(pin: string) {
    const user = await this.prisma.user.findUnique({ where: { pin } });
    if (!user) {
      throw new UnauthorizedException('Invalid pin');
    }
    return user;
  }

  async login(pin: string) {
    const user = await this.validateUser(pin);
    const payload = { sub: user.id, role: user.role, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload)
    };
  }

  async register(name: string, pin: string, role: Role) {
    const user = await this.prisma.user.create({ data: { name, pin, role } });
    return user;
  }
}
