import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  listCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  createCategory(data: Prisma.CategoryCreateInput) {
    return this.prisma.category.create({ data });
  }

  listProducts() {
    return this.prisma.product.findMany({ include: { category: true } });
  }

  createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }

  updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({ where: { id }, data });
  }

  listExtras() {
    return this.prisma.extra.findMany();
  }

  createExtra(data: Prisma.ExtraCreateInput) {
    return this.prisma.extra.create({ data });
  }
}
