import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import { getEmailService } from '@/Backend/services/email';
import crypto from 'crypto';

// Prevent any response caching — every request must be evaluated fresh
export const dynamic = 'force-dynamic';

const TOKEN_EXPIRY_MINUTES = 30;

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log(`[Forgot Password] Request for email: ${email} - User found in DB: ${!!user}`);

    // We still return success even if user not found to prevent user enumeration
    if (user) {
      // 1. Generate random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      // 2. Set expiration using explicit UTC arithmetic (30 minutes from now)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // 3. Invalidate all previous unused tokens for this user, then create new one
      await prisma.$transaction([
        // Mark all existing unused tokens as used (invalidate them)
        prisma.passwordResetToken.updateMany({
          where: {
            userId: user.id,
            usedAt: null,
          },
          data: {
            usedAt: now, // Mark as used so they can't be reused
          },
        }),
        // Create new token
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        }),
      ]);

      console.log(`[Forgot Password] Token created for user ${user.id}, expires at ${expiresAt.toISOString()}`);

      // 4. Send email
      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
      
      try {
        const emailService = getEmailService();
        await emailService.sendPasswordResetEmail(user.email, resetUrl, TOKEN_EXPIRY_MINUTES);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        return NextResponse.json(
          { error: 'Hệ thống gửi email đang gặp sự cố. Vui lòng thử lại sau.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: 'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
