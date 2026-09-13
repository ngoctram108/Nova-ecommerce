import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Prevent any response caching — every request must be evaluated fresh
export const dynamic = 'force-dynamic';

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
    const now = new Date();

    // 2. Find valid token in DB — filter at DATABASE level for defense-in-depth
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,             // Must not be already used
        expiresAt: { gt: now },   // Must not be expired (DB-level enforcement)
      },
      include: {
        user: true,
      }
    });

    // 3. Validate token — single generic error to prevent information leakage
    if (!resetTokenRecord) {
      console.log(`[Reset Password] Token rejected — not found, expired, or already used. Hash prefix: ${tokenHash.substring(0, 8)}...`);
      return NextResponse.json(
        { error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.' },
        { status: 400 }
      );
    }

    // 4. Double-check expiration in JS as defense-in-depth (guards against DB clock skew)
    if (resetTokenRecord.expiresAt <= now) {
      console.log(`[Reset Password] Token expired (JS check). expiresAt=${resetTokenRecord.expiresAt.toISOString()}, now=${now.toISOString()}`);
      return NextResponse.json(
        { error: 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu một liên kết mới.' },
        { status: 400 }
      );
    }

    // 5. Double-check usedAt in JS as defense-in-depth
    if (resetTokenRecord.usedAt) {
      console.log(`[Reset Password] Token already used (JS check). usedAt=${resetTokenRecord.usedAt.toISOString()}`);
      return NextResponse.json(
        { error: 'Link đặt lại mật khẩu này đã được sử dụng.' },
        { status: 400 }
      );
    }

    // 6. Hash new password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // 7. Update database in an atomic transaction
    await prisma.$transaction([
      // Update user password
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword },
      }),
      // Mark token as used — prevents reuse
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: now },
      })
    ]);

    console.log(`[Reset Password] Password updated successfully for user ${resetTokenRecord.userId}`);

    return NextResponse.json({
      message: 'Đặt lại mật khẩu thành công.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
