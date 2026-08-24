// ─────────────────────────────────────────────
// NORA E-Commerce — Users Mock Data
// ─────────────────────────────────────────────

import { User } from '@/lib/types';

export const users: User[] = [
  {
    id: 'u_001',
    name: 'Demo Customer',
    email: 'demo@example.com',
    phone: '0912345678',
    role: 'CUSTOMER',
    wishlist: ['p_001', 'p_011', 'p_017', 'p_027'],
    orders: ['ND-A1B2C3'],
  },
  {
    id: 'u_admin',
    name: 'Admin',
    email: 'admin@nora.com',
    phone: '0900000000',
    role: 'ADMIN',
    wishlist: [],
    orders: [],
  },
];

/* ── Auth mock credentials ── */

export const MOCK_CREDENTIALS = {
  customer: {
    email: 'demo@example.com',
    password: 'demo123',
  },
  admin: {
    email: 'admin@nora.com',
    password: 'admin123',
  },
};

/* ── Helper functions ── */

export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function validateCredentials(
  email: string,
  password: string
): User | null {
  if (
    email === MOCK_CREDENTIALS.customer.email &&
    password === MOCK_CREDENTIALS.customer.password
  ) {
    return users.find((u) => u.id === 'u_001') ?? null;
  }
  if (
    email === MOCK_CREDENTIALS.admin.email &&
    password === MOCK_CREDENTIALS.admin.password
  ) {
    return users.find((u) => u.id === 'u_admin') ?? null;
  }
  return null;
}
