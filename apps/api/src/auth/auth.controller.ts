import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  pin!: string;
}

class RegisterDto {
  @IsString()
  name!: string;

  @IsString()
  pin!: string;

  @IsEnum(Role)
  role!: Role;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.auth.login(body.pin);
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.auth.register(body.name, body.pin, body.role);
  }
}
