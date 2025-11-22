export enum Role {
  CASHIER = 'CASHIER',
  KITCHEN = 'KITCHEN',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum Channel {
  COUNTER = 'COUNTER',
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY'
}

export type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  priceSolo: number;
  priceCombo?: number | null;
  isAvailable: boolean;
  canBeCombo: boolean;
};

export type Extra = {
  id: string;
  name: string;
  price: number;
  productId?: string | null;
  isGlobal: boolean;
  isSwap?: boolean;
};

export type User = {
  id: string;
  name: string;
  pin: string;
  role: Role;
};

export type OrderItemExtra = {
  id: string;
  extraId: string;
  price: number;
  extra?: Extra;
};

export type OrderItem = {
  id: string;
  productId: string;
  qty: number;
  notes?: string | null;
  unitPrice: number;
  isCombo: boolean;
  extras?: OrderItemExtra[];
};

export type Order = {
  id: string;
  number: number;
  status: OrderStatus;
  channel: Channel;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};
