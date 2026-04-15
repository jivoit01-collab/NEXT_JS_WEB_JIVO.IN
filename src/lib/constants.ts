export const SITE_NAME = 'Jivo Wellness';
export const SITE_DESCRIPTION =
  "India's Largest Cold Press Canola Oil Seller — Premium Oils, Superfoods & Wellness Products";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://jivo.in';

export const FREE_SHIPPING_THRESHOLD = 499;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const ITEMS_PER_PAGE = {
  products: 12,
  blog: 9,
  admin: 20,
  reviews: 5,
  orders: 10,
} as const;

export const RATE_LIMITS = {
  auth: { requests: 5, window: '1m' },
  contact: { requests: 3, window: '1m' },
  payment: { requests: 10, window: '1m' },
  general: { requests: 60, window: '1m' },
  admin: { requests: 120, window: '1m' },
} as const;
