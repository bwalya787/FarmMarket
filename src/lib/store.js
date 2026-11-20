// Cart + Watchlist store using localStorage with pub/sub

const CART_KEY = 'farmmarket_cart';
const WATCH_KEY = 'farmmarket_watchlist';

const listeners = new Set();

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function notify() {
  listeners.forEach((fn) => fn());
}

// ===== Cart =====

export function getCart() {
  return load(CART_KEY, []);
}

export function addToCart(item, qty = 1) {
  const cart = getCart();
  const existing = cart.find((c) => c.listingId === item.listingId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + qty, item.maxAvailable);
  } else {
    cart.push({ ...item, quantity: Math.min(qty, item.maxAvailable) });
  }
  save(CART_KEY, cart);
  notify();
  openCart();
}

export function updateQty(listingId, qty) {
  const cart = getCart();
  const item = cart.find((c) => c.listingId === listingId);
  if (item) {
    item.quantity = Math.max(1, Math.min(qty, item.maxAvailable));
    save(CART_KEY, cart);
    notify();
  }
}

export function removeFromCart(listingId) {
  const cart = getCart().filter((c) => c.listingId !== listingId);
  save(CART_KEY, cart);
  notify();
}

export function clearCart() {
  save(CART_KEY, []);
  notify();
}

export function cartCount() {
  return getCart().reduce((sum, c) => sum + c.quantity, 0);
}

export function cartTotal() {
  return getCart().reduce((sum, c) => sum + c.quantity * c.price, 0);
}

// ===== Watchlist =====

export function getWatchlist() {
  return load(WATCH_KEY, []);
}

export function isWatched(id) {
  return getWatchlist().some((w) => w.id === id);
}

export function toggleWatch(item) {
  const list = getWatchlist();
  if (list.some((w) => w.id === item.id)) {
    save(WATCH_KEY, list.filter((w) => w.id !== item.id));
  } else {
    list.push({ ...item, addedAt: new Date().toISOString() });
    save(WATCH_KEY, list);
  }
  notify();
}

export function removeFromWatchlist(id) {
  save(WATCH_KEY, getWatchlist().filter((w) => w.id !== id));
  notify();
}

// ===== Cart drawer open state =====

let cartOpen = false;

export function isCartOpen() { return cartOpen; }
export function openCart() { cartOpen = true; notify(); }
export function closeCart() { cartOpen = false; notify(); }

// ===== Pub/sub =====

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
