// ─────────────────────────────────────────────
// NORA E-Commerce — Domain Types
// Source of truth: IMPLEMENT.md §8 Data Model
// ─────────────────────────────────────────────

/* ── Product ── */

export interface ProductColor {
  name: string;
  hex: string;
  swatch?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  verified: boolean;
}

export type ProductBadge = 'NEW' | 'SALE' | 'FEATURED';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  subcategory?: string;
  subcategorySlug?: string;
  tags?: string[];
  description: string;
  price: number;
  compareAt?: number;
  currency: 'VND';
  rating: number;
  reviewCount: number;
  images: string[];
  thumbnail: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSourceUrl?: string;
  badge?: ProductBadge;
  stock: number;
  colors?: ProductColor[];
  sizes?: string[];
  variants?: ProductVariant[];
  specs: Record<string, string>;
  featured: boolean;
  createdAt: string;
}

/* ── Category ── */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

/* ── Cart ── */

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  thumbnail: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSourceUrl?: string;
  variant?: string;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
  lastUpdated: string;
}

/* ── Address ── */

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  note?: string;
}

/* ── Order ── */

export type PaymentMethod = 'COD' | 'MOCK_CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

export type DeliveryMethod = 'STANDARD' | 'EXPRESS';

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  thumbnail: string;
  imageUrl?: string;
  imageAlt?: string;
  imageSourceUrl?: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: ShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
}

/* ── User ── */

export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  wishlist: string[];
  orders: string[];
  avatar?: string;
}

/* ── API Response ── */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: Record<string, string[]>;
}

/* ── Filter / Sort ── */

export type SortOption =
  | 'recommended'
  | 'newest'
  | 'rating'
  | 'price-asc'
  | 'price-desc';

export interface ProductFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  color?: string;
  size?: string;
  inStock?: boolean;
  badge?: ProductBadge;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

/* ── Checkout ── */

export interface CheckoutData {
  shipping: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
}

/* ── Toast ── */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/* ── Status Transition Map ── */

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
