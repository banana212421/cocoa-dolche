import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { emptyTailoredState, type TastefullyTailoredState } from "@/data/tastefullyTailored";

export type CartLine = { label: string; qty: number };

export type CartItem = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  image?: string;
  lines: CartLine[];
  oneTimeFee?: number;
  productDetails?:
    | {
        kind: "custom-box";
        boxSize: number;
        layout?: (string | null)[];
        logoSetup?: { colors: 1 | 2 | 3; fee: number };
      }
    | { kind: "chocolate-bars"; miniPerBundle: number; fullPerBundle: number; tastingPerBundle: number };
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  tailored: TastefullyTailoredState;
  setTailored: (value: TastefullyTailoredState) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cocoa-dolce-cart";
const TAILORED_STORAGE_KEY = "cocoa-dolce-tailored";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tailored, setTailoredState] = useState<TastefullyTailoredState>(emptyTailoredState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
      const tailoredRaw = window.localStorage.getItem(TAILORED_STORAGE_KEY);
      if (tailoredRaw) setTailoredState(JSON.parse(tailoredRaw) as TastefullyTailoredState);
    } catch {
      /* ignore unreadable cart */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const setTailored = useCallback((value: TastefullyTailoredState) => {
    setTailoredState(value);
    try {
      window.localStorage.setItem(TAILORED_STORAGE_KEY, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((current) => [...current, { ...item, id }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.floor(quantity) || 1) } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setTailored(emptyTailoredState);
  }, [setTailored]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice + (item.oneTimeFee ?? 0), 0);
    return { items, addItem, removeItem, setQuantity, clearCart, itemCount, total, tailored, setTailored };
  }, [items, addItem, removeItem, setQuantity, clearCart, tailored, setTailored]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}
