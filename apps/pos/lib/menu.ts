import { Category, Product, Extra } from '@alfajor/types';

export const categories: Category[] = [
  { id: 'cat-alfajores', name: 'Alfajores', sortOrder: 1 },
  { id: 'cat-especiales', name: 'Especiales', sortOrder: 2 },
  { id: 'cat-bebidas', name: 'Bebidas', sortOrder: 3 },
  { id: 'cat-tragos', name: 'Tragos', sortOrder: 4 }
];

export const products: Product[] = [
  {
    id: 'prod-cheese',
    name: 'Cheese',
    description: 'Carne y cheddar',
    categoryId: 'cat-alfajores',
    priceSolo: 8000,
    priceCombo: 11000,
    isAvailable: true,
    canBeCombo: true
  },
  {
    id: 'prod-onion',
    name: 'Onion',
    description: 'Smash con cebolla en plancha y cheddar',
    categoryId: 'cat-alfajores',
    priceSolo: 9000,
    priceCombo: 12000,
    isAvailable: true,
    canBeCombo: true
  },
  {
    id: 'prod-american',
    name: 'American',
    description: 'Lechuga, tomate y salsa especial',
    categoryId: 'cat-alfajores',
    priceSolo: 9000,
    priceCombo: 12000,
    isAvailable: true,
    canBeCombo: true
  },
  {
    id: 'prod-pickle',
    name: 'Pickle',
    description: 'Pepinos encurtidos, cebolla morada y salsa pickle',
    categoryId: 'cat-alfajores',
    priceSolo: 9000,
    priceCombo: 12000,
    isAvailable: true,
    canBeCombo: true
  },
  {
    id: 'prod-caja',
    name: 'Caja de Alfajores',
    description: '4 Cheese simples',
    categoryId: 'cat-especiales',
    priceSolo: 20000,
    priceCombo: null,
    isAvailable: true,
    canBeCombo: false
  },
  {
    id: 'prod-papas',
    name: 'Bandeja de Papas',
    description: 'Papas solas',
    categoryId: 'cat-especiales',
    priceSolo: 4000,
    priceCombo: null,
    isAvailable: true,
    canBeCombo: false
  },
  {
    id: 'prod-papas-bacon',
    name: 'Bandeja de Papas con bacon y salsita',
    categoryId: 'cat-especiales',
    priceSolo: 5000,
    priceCombo: null,
    isAvailable: true,
    canBeCombo: false
  },
  { id: 'prod-gaseosa', name: 'Gaseosa', categoryId: 'cat-bebidas', priceSolo: 2500, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-agua-saborizada', name: 'Agua saborizada', categoryId: 'cat-bebidas', priceSolo: 2500, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-agua', name: 'Agua / Soda', categoryId: 'cat-bebidas', priceSolo: 2000, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-liso', name: 'Liso Santa Fe', categoryId: 'cat-bebidas', priceSolo: 1000, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-pinta', name: 'Pinta Heineken', categoryId: 'cat-bebidas', priceSolo: 4000, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-fernet', name: 'Fernet', categoryId: 'cat-tragos', priceSolo: 3000, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-gin', name: 'Gin Heredero', categoryId: 'cat-tragos', priceSolo: 3000, priceCombo: null, isAvailable: true, canBeCombo: false },
  { id: 'prod-vermut', name: 'Vermut', categoryId: 'cat-tragos', priceSolo: 3000, priceCombo: null, isAvailable: true, canBeCombo: false }
];

export const extras: Extra[] = [
  { id: 'extra-bacon', name: 'Bacon', price: 1000, productId: 'prod-cheese', isGlobal: false },
  { id: 'extra-pickles', name: 'Pepinos encurtidos', price: 0, productId: null, isGlobal: true },
  { id: 'extra-medallon', name: 'Medallón extra', price: 2000, productId: null, isGlobal: true },
  { id: 'extra-veggie', name: 'Medallón veggie', price: 0, productId: null, isGlobal: true, isSwap: true }
];
