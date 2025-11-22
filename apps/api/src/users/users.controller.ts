import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { IsEnum, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { JwtAuthGuard, RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  pin!: string;

  @IsEnum(Role)
  role!: Role;
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  list() {
    return this.users.list();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: CreateUserDto) {
    return this.users.create(body);
  }
}
