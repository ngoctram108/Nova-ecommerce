import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import { createSession } from '@/Backend/auth/session';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // ── Server-side validation ──

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập họ tên.' }, { status: 400 });
    }

    if (name.trim().length < 2) {
      return NextResponse.json({ error: 'Họ tên phải có ít nhất 2 ký tự.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập email.' }, { status: 400 });
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Email không đúng định dạng.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Vui lòng nhập mật khẩu.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 8 ký tự.' }, { status: 400 });
    }

    // ── Check duplicate email ──

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email này đã được sử dụng.' }, { status: 409 });
    }

    // ── Hash password with bcryptjs (consistent with login route) ──

    const hashedPassword = bcrypt.hashSync(password, 10);

    // ── Create user with CUSTOMER role (enforced server-side, ignoring any role from client) ──

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    // ── Auto-login: create session (consistent with login flow) ──

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
