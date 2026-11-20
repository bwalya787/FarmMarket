import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type CartItem = {
  listingId: string;
  title: string;
  price: number;
  unit: string;
  imageUrl: string | null;
  farmId: string;
  farmName: string;
  quantity: number;
  maxAvailable: number;
};

export type WatchlistItem = {
  id: string;
  type: 'listing' | 'farm';
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  addedAt: string;
};

type ShopContextValue = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateQty: (listingId: string, qty: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  watchlist: WatchlistItem[];
  toggleWatch: (item: Omit<WatchlistItem, 'addedAt'>) => void;
  isWatched: (id: string) => boolean;
  removeFromWatchlist: (id: string) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const CART_KEY = 'farmmarket_cart';
const WATCH_KEY = 'farmmarket_watchlist';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load(CART_KEY, []));
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => load(WATCH_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WATCH_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToCart: ShopContextValue['addToCart'] = (item, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.listingId === item.listingId);
      if (existing) {
        const newQty = Math.min(existing.quantity + qty, item.maxAvailable);
        return prev.map((c) => c.listingId === item.listingId ? { ...c, quantity: newQty } : c);
      }
      return [...prev, { ...item, quantity: Math.min(qty, item.maxAvailable) }];
    });
    setCartOpen(true);
  };

  const updateQty: ShopContextValue['updateQty'] = (listingId, qty) => {
    setCart((prev) => prev.map((c) =>
      c.listingId === listingId ? { ...c, quantity: Math.max(1, Math.min(qty, c.maxAvailable)) } : c
    ));
  };

  const removeFromCart: ShopContextValue['removeFromCart'] = (listingId) => {
    setCart((prev) => prev.filter((c) => c.listingId !== listingId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartTotal = cart.reduce((sum, c) => sum + c.quantity * c.price, 0);

  const toggleWatch: ShopContextValue['toggleWatch'] = (item) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.id === item.id)) {
        return prev.filter((w) => w.id !== item.id);
      }
      return [...prev, { ...item, addedAt: new Date().toISOString() }];
    });
  };

  const isWatched: ShopContextValue['isWatched'] = (id) =>
    watchlist.some((w) => w.id === id);

  const removeFromWatchlist: ShopContextValue['removeFromWatchlist'] = (id) => {
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
  };

  return (
    <ShopContext.Provider value={{
      cart, addToCart, updateQty, removeFromCart, clearCart,
      cartCount, cartTotal, cartOpen, setCartOpen,
      watchlist, toggleWatch, isWatched, removeFromWatchlist,
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
}
