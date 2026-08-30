import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';
import { getEmailService } from '@/Backend/services/email';
import crypto from 'crypto';

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

      // 2. Set expiration (30 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      // 3. Save to database
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // 4. Send email
      const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;
      
      try {
        const emailService = getEmailService();
        await emailService.sendPasswordResetEmail(user.email, resetUrl, 30);
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
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
