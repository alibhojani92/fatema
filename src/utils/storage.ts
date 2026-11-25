export const STORAGE_KEYS = {
  PRODUCTS: 'fra_products_v1',
  ORDERS: 'fra_orders_v1',
  QUOTES: 'fra_quotes_v1',
  ACCOUNTS: 'fra_accounts_v1',
  SESSION_USER_ID: 'fra_session_user_id_v1',
  CART: 'fra_cart_v1',
  WISHLIST: 'fra_wishlist_v1',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors in restricted sandboxes
  }
}
