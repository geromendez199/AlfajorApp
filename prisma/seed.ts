import { PrismaClient, Role, Channel, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.$transaction([
    prisma.category.upsert({
      where: { name: 'Alfajores' },
      update: {},
      create: { name: 'Alfajores', sortOrder: 1 }
    }),
    prisma.category.upsert({
      where: { name: 'Especiales' },
      update: {},
      create: { name: 'Especiales', sortOrder: 2 }
    }),
    prisma.category.upsert({
      where: { name: 'Bebidas' },
      update: {},
      create: { name: 'Bebidas', sortOrder: 3 }
    }),
    prisma.category.upsert({
      where: { name: 'Tragos' },
      update: {},
      create: { name: 'Tragos', sortOrder: 4 }
    })
  ]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  const productsData = [
    {
      name: 'Cheese',
      description: 'Carne y cheddar',
      categoryId: categoryMap['Alfajores'],
      priceSolo: 8000,
      priceCombo: 11000,
      canBeCombo: true
    },
    {
      name: 'Onion',
      description: 'Smash con cebolla en plancha y cheddar',
      categoryId: categoryMap['Alfajores'],
      priceSolo: 9000,
      priceCombo: 12000,
      canBeCombo: true
    },
    {
      name: 'American',
      description: 'Lechuga, tomate y salsa especial',
      categoryId: categoryMap['Alfajores'],
      priceSolo: 9000,
      priceCombo: 12000,
      canBeCombo: true
    },
    {
      name: 'Pickle',
      description: 'Pepinos encurtidos, cebolla morada y salsa pickle',
      categoryId: categoryMap['Alfajores'],
      priceSolo: 9000,
      priceCombo: 12000,
      canBeCombo: true
    },
    {
      name: 'Caja de Alfajores',
      description: '4 Cheese simples',
      categoryId: categoryMap['Especiales'],
      priceSolo: 20000,
      canBeCombo: false
    },
    {
      name: 'Bandeja de Papas',
      description: 'Papas solas',
      categoryId: categoryMap['Especiales'],
      priceSolo: 4000,
      canBeCombo: false
    },
    {
      name: 'Bandeja de Papas con bacon y salsita',
      description: 'Papas con topping de bacon y salsa',
      categoryId: categoryMap['Especiales'],
      priceSolo: 5000,
      canBeCombo: false
    },
    { name: 'Gaseosa', categoryId: categoryMap['Bebidas'], priceSolo: 2500, canBeCombo: false },
    { name: 'Agua saborizada', categoryId: categoryMap['Bebidas'], priceSolo: 2500, canBeCombo: false },
    { name: 'Agua / Soda', categoryId: categoryMap['Bebidas'], priceSolo: 2000, canBeCombo: false },
    { name: 'Liso Santa Fe', categoryId: categoryMap['Bebidas'], priceSolo: 1000, canBeCombo: false },
    { name: 'Pinta Heineken', categoryId: categoryMap['Bebidas'], priceSolo: 4000, canBeCombo: false },
    { name: 'Fernet', categoryId: categoryMap['Tragos'], priceSolo: 3000, canBeCombo: false },
    { name: 'Gin Heredero', categoryId: categoryMap['Tragos'], priceSolo: 3000, canBeCombo: false },
    { name: 'Vermut', categoryId: categoryMap['Tragos'], priceSolo: 3000, canBeCombo: false }
  ];

  const products = await Promise.all(
    productsData.map((product) =>
      prisma.product.upsert({
        where: { name: product.name },
        update: product,
        create: product
      })
    )
  );

  const productMap = Object.fromEntries(products.map((p) => [p.name, p.id]));

  await prisma.$transaction([
    prisma.extra.upsert({
      where: { name: 'Bacon' },
      update: {},
      create: {
        name: 'Bacon',
        price: 1000,
        productId: productMap['Cheese'],
        isGlobal: false
      }
    }),
    prisma.extra.upsert({
      where: { name: 'Pepinos encurtidos' },
      update: {},
      create: {
        name: 'Pepinos encurtidos',
        price: 0,
        isGlobal: true
      }
    }),
    prisma.extra.upsert({
      where: { name: 'Medallón extra' },
      update: {},
      create: {
        name: 'Medallón extra',
        price: 2000,
        isGlobal: true
      }
    }),
    prisma.extra.upsert({
      where: { name: 'Medallón veggie' },
      update: {},
      create: {
        name: 'Medallón veggie',
        price: 0,
        isGlobal: true,
        isSwap: true
      }
    })
  ]);

  await prisma.user.upsert({
    where: { pin: '0000' },
    update: {},
    create: {
      name: 'Admin',
      pin: '0000',
      role: Role.ADMIN
    }
  });

  await prisma.order.create({
    data: {
      channel: Channel.COUNTER,
      status: OrderStatus.PENDING,
      total: 0,
      items: {
        create: []
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
