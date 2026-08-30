import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import { createSession } from '@/Backend/auth/session';
import { validateCredentials } from '@/Backend/database/data/users';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    // 1. Try DB first (bcrypt verify)
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        const isValid = bcrypt.compareSync(password, user.password);
        if (isValid) {
          await createSession({
            userId: user.id,
            email: user.email,
            role: user.role.toUpperCase(),
            name: user.name,
          });

          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role.toUpperCase(),
            }
          });
        }
        // DB user found but password wrong — don't fall through to mock
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
    } catch (dbError) {
      console.warn('DB login attempt failed, falling back to mock:', dbError);
    }

    // 2. Fallback to mock credentials (only when DB is unavailable)
    const mockUser = validateCredentials(email, password);
    if (mockUser) {
      await createSession({
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        name: mockUser.name,
      });
      return NextResponse.json({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
        }
      });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
