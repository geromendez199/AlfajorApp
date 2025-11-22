import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MenuService } from './menu.service';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard, RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

class CreateCategoryDto {
  @IsString()
  name!: string;
}

class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  categoryId!: string;

  @IsInt()
  priceSolo!: number;

  @IsOptional()
  @IsInt()
  priceCombo?: number | null;

  @IsOptional()
  @IsBoolean()
  canBeCombo?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateProductDto {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

class CreateExtraDto {
  @IsString()
  name!: string;

  @IsInt()
  price!: number;

  @IsOptional()
  @IsString()
  productId?: string | null;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsBoolean()
  isSwap?: boolean;
}

@Controller('menu')
export class MenuController {
  constructor(private menu: MenuService) {}

  @Get('categories')
  listCategories() {
    return this.menu.listCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createCategory(@Body() body: CreateCategoryDto) {
    return this.menu.createCategory(body);
  }

  @Get('products')
  listProducts() {
    return this.menu.listProducts();
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createProduct(@Body() body: CreateProductDto) {
    return this.menu.createProduct({ ...body, isAvailable: true, canBeCombo: body.canBeCombo ?? false });
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.menu.updateProduct(id, body);
  }

  @Get('extras')
  listExtras() {
    return this.menu.listExtras();
  }

  @Post('extras')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createExtra(@Body() body: CreateExtraDto) {
    return this.menu.createExtra(body);
  }
}
