// ─────────────────────────────────────────────
// NORA E-Commerce — Orders Mock Data
// 10+ orders across all statuses
// Source of truth: IMPLEMENT.md §9.3
// ─────────────────────────────────────────────

import { Order } from '@/Shared/types';

export let orders: Order[] = [
  {
    id: 'ND-A1B2C3',
    items: [
      { productId: 'p_001', variantId: 'v_001b', name: 'Oversized Merino Sweater', thumbnail: '/images/products/merino-sweater-1.jpg', variant: 'Oatmeal / M', quantity: 1, unitPrice: 1_890_000, total: 1_890_000 },
      { productId: 'p_028', name: 'Slim Leather Card Holder', thumbnail: '/images/products/card-holder-1.jpg', quantity: 1, unitPrice: 490_000, total: 490_000 },
    ],
    customer: { fullName: 'Nguyễn Minh Anh', phone: '0912345678', email: 'minh.anh@example.com', address: '123 Nguyễn Huệ', city: 'Hồ Chí Minh', district: 'Quận 1' },
    subtotal: 2_380_000,
    shippingFee: 0,
    discount: 0,
    total: 2_380_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'DELIVERED',
    createdAt: '2026-07-01T09:30:00Z',
  },
  {
    id: 'ND-D4E5F6',
    items: [
      { productId: 'p_011', variantId: 'v_011b', name: 'Minimalist Leather Sneaker', thumbnail: '/images/products/leather-sneaker-1.jpg', variant: 'White / 42', quantity: 1, unitPrice: 2_290_000, total: 2_290_000 },
    ],
    customer: { fullName: 'Trần Đức Huy', phone: '0987654321', email: 'duc.huy@example.com', address: '456 Lê Lợi', city: 'Hà Nội', district: 'Hoàn Kiếm' },
    subtotal: 2_290_000,
    shippingFee: 0,
    discount: 0,
    total: 2_290_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPING',
    createdAt: '2026-07-15T14:00:00Z',
  },
  {
    id: 'ND-G7H8I9',
    items: [
      { productId: 'p_017', name: 'Leather Weekender Bag', thumbnail: '/images/products/weekender-1.jpg', quantity: 1, unitPrice: 5_490_000, total: 5_490_000 },
      { productId: 'p_022', name: 'Leather Travel Dopp Kit', thumbnail: '/images/products/dopp-kit-1.jpg', quantity: 1, unitPrice: 790_000, total: 790_000 },
    ],
    customer: { fullName: 'Lê Thanh Hà', phone: '0909123456', email: 'thanh.ha@example.com', address: '789 Trần Hưng Đạo', city: 'Đà Nẵng' },
    subtotal: 6_280_000,
    shippingFee: 0,
    discount: 0,
    total: 6_280_000,
    deliveryMethod: 'EXPRESS',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    createdAt: '2026-08-01T11:00:00Z',
  },
  {
    id: 'ND-J1K2L3',
    items: [
      { productId: 'p_003', name: 'Organic Cotton T-Shirt', thumbnail: '/images/products/cotton-tee-1.jpg', quantity: 3, unitPrice: 490_000, total: 1_470_000 },
    ],
    customer: { fullName: 'Phạm Thị Lan', phone: '0901234567', email: 'thi.lan@example.com', address: '321 Hai Bà Trưng', city: 'Hồ Chí Minh', district: 'Quận 3' },
    subtotal: 1_470_000,
    shippingFee: 0,
    discount: 0,
    total: 1_470_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    createdAt: '2026-08-10T08:00:00Z',
  },
  {
    id: 'ND-M4N5O6',
    items: [
      { productId: 'p_036', name: 'Cedar & Bergamot Candle', thumbnail: '/images/products/candle-1.jpg', quantity: 2, unitPrice: 590_000, total: 1_180_000 },
      { productId: 'p_032', name: 'Braided Leather Keychain', thumbnail: '/images/products/keychain-1.jpg', quantity: 1, unitPrice: 290_000, total: 290_000 },
    ],
    customer: { fullName: 'Võ Hoàng Nam', phone: '0978123456', email: 'hoang.nam@example.com', address: '654 Pasteur', city: 'Hồ Chí Minh', district: 'Quận 1' },
    subtotal: 1_470_000,
    shippingFee: 0,
    discount: 0,
    total: 1_470_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'CANCELLED',
    createdAt: '2026-07-20T16:00:00Z',
  },
  {
    id: 'ND-P7Q8R9',
    items: [
      { productId: 'p_007', name: 'Japanese Selvedge Denim Jacket', thumbnail: '/images/products/denim-jacket-1.jpg', quantity: 1, unitPrice: 3_290_000, total: 3_290_000 },
    ],
    customer: { fullName: 'Đặng Quốc Bảo', phone: '0965432109', email: 'quoc.bao@example.com', address: '987 Điện Biên Phủ', city: 'Hà Nội', district: 'Ba Đình' },
    subtotal: 3_290_000,
    shippingFee: 0,
    discount: 0,
    total: 3_290_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'ND-S1T2U3',
    items: [
      { productId: 'p_035', name: 'Ceramic Pour-Over Set', thumbnail: '/images/products/pour-over-1.jpg', quantity: 1, unitPrice: 1_490_000, total: 1_490_000 },
      { productId: 'p_038', name: 'Leather Bound Journal', thumbnail: '/images/products/journal-1.jpg', quantity: 2, unitPrice: 690_000, total: 1_380_000 },
    ],
    customer: { fullName: 'Bùi Ngọc Trang', phone: '0934567890', email: 'ngoc.trang@example.com', address: '147 Lý Tự Trọng', city: 'Hồ Chí Minh', district: 'Quận 1' },
    subtotal: 2_870_000,
    shippingFee: 0,
    discount: 0,
    total: 2_870_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'CONFIRMED',
    createdAt: '2026-08-05T13:00:00Z',
  },
  {
    id: 'ND-V4W5X6',
    items: [
      { productId: 'p_027', name: 'Titanium Frame Sunglasses', thumbnail: '/images/products/sunglasses-1.jpg', quantity: 1, unitPrice: 3_290_000, total: 3_290_000 },
    ],
    customer: { fullName: 'Hoàng Thị Yến', phone: '0945678901', email: 'thi.yen@example.com', address: '258 Nguyễn Thị Minh Khai', city: 'Hồ Chí Minh', district: 'Quận 3' },
    subtotal: 3_290_000,
    shippingFee: 0,
    discount: 0,
    total: 3_290_000,
    deliveryMethod: 'EXPRESS',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    status: 'SHIPPING',
    createdAt: '2026-08-12T09:00:00Z',
  },
  {
    id: 'ND-Y7Z8A9',
    items: [
      { productId: 'p_004', name: 'Linen Blend Relaxed Shirt', thumbnail: '/images/products/linen-shirt-1.jpg', quantity: 1, unitPrice: 890_000, total: 890_000 },
    ],
    customer: { fullName: 'Ngô Văn Phong', phone: '0956789012', email: 'van.phong@example.com', address: '369 Cách Mạng Tháng 8', city: 'Hồ Chí Minh', district: 'Quận 10' },
    subtotal: 890_000,
    shippingFee: 30_000,
    discount: 0,
    total: 920_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    createdAt: '2026-08-18T15:00:00Z',
  },
  {
    id: 'ND-B1C2D3',
    items: [
      { productId: 'p_030', name: 'Automatic Dress Watch', thumbnail: '/images/products/watch-1.jpg', quantity: 1, unitPrice: 8_900_000, total: 8_900_000 },
      { productId: 'p_029', name: 'Cashmere Wrap Scarf', thumbnail: '/images/products/cashmere-scarf-1.jpg', quantity: 1, unitPrice: 1_890_000, total: 1_890_000 },
    ],
    customer: { fullName: 'Trương Minh Khôi', phone: '0967890123', email: 'minh.khoi@example.com', address: '741 Võ Văn Tần', city: 'Hồ Chí Minh', district: 'Quận 3' },
    subtotal: 10_790_000,
    shippingFee: 0,
    discount: 0,
    total: 10_790_000,
    deliveryMethod: 'EXPRESS',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    createdAt: '2026-06-28T11:00:00Z',
  },
  {
    id: 'ND-E4F5G6',
    items: [
      { productId: 'p_006', variantId: 'v_006a', name: 'Relaxed Fit Chinos', thumbnail: '/images/products/chinos-1.jpg', variant: 'Sand / 30', quantity: 2, unitPrice: 990_000, total: 1_980_000 },
      { productId: 'p_025', name: 'Hand-Braided Leather Belt', thumbnail: '/images/products/braided-belt-1.jpg', quantity: 1, unitPrice: 890_000, total: 890_000 },
    ],
    customer: { fullName: 'Lý Hoàng Sơn', phone: '0923456789', email: 'hoang.son@example.com', address: '852 Nguyễn Đình Chiểu', city: 'Hồ Chí Minh', district: 'Quận 3' },
    subtotal: 2_870_000,
    shippingFee: 0,
    discount: 0,
    total: 2_870_000,
    deliveryMethod: 'STANDARD',
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'PENDING',
    createdAt: '2026-08-19T10:00:00Z',
  },
];

/* ── Helper functions ── */

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getOrdersByStatus(status: string): Order[] {
  return orders.filter((o) => o.status === status);
}

export function addOrder(order: Order): void {
  orders = [order, ...orders];
}

export function updateOrderStatus(
  id: string,
  status: Order['status']
): Order | undefined {
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;
    if (status === 'DELIVERED' || status === 'CONFIRMED') {
      order.paymentStatus = 'PAID';
    }
  }
  return order;
}

/* ── Statistics ── */

export function getOrderStats() {
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const shippingOrders = orders.filter((o) => o.status === 'SHIPPING').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;

  const uniqueCustomers = new Set(orders.map((o) => o.customer.email)).size;

  return {
    totalRevenue,
    totalOrders,
    pendingOrders,
    shippingOrders,
    deliveredOrders,
    cancelledOrders,
    uniqueCustomers,
  };
}
