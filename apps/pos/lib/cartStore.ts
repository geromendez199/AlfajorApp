import create from 'zustand';
import { OrderItem, Extra, Product } from '@alfajor/types';

export type CartItem = OrderItem & { product: Product; extras: (Extra & { quantity: number })[] };

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
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
  updateQuantity: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    })),
  clear: () => set({ items: [] })
}));

export const calculateTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => {
    const extrasTotal = item.extras?.reduce((acc, ex) => acc + ex.price * ex.quantity, 0) ?? 0;
    return sum + item.unitPrice * item.qty + extrasTotal * item.qty;
  }, 0);
