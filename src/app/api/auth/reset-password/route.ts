import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing token or password' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // 1. Hash the incoming token to search in DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find token in DB
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
      },
      include: {
        user: true,
      }
    });

    // 3. Validate token
    if (!resetTokenRecord) {
      return NextResponse.json({ error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' }, { status: 400 });
    }

    if (resetTokenRecord.usedAt) {
      return NextResponse.json({ error: 'Link đặt lại mật khẩu này đã được sử dụng.' }, { status: 400 });
    }

    if (resetTokenRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link đặt lại mật khẩu đã hết hạn.' }, { status: 400 });
    }

    // 4. Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 5. Update database in a transaction
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      // Mark token as used
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      })
    ]);

    return NextResponse.json({
      message: 'Đặt lại mật khẩu thành công.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
