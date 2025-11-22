import create from 'zustand';
import { OrderItem, Extra, Product } from '@alfajor/types';

export type CartItem = OrderItem & { product: Product; extras: (Extra & { quantity: number })[] };

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item]
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id)
    })),
  clear: () => set({ items: [] })
}));

export const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => {
    const extrasTotal = item.extras?.reduce((acc, ex) => acc + ex.price * ex.quantity, 0) ?? 0;
    return sum + item.unitPrice * item.qty + extrasTotal;
  }, 0);
