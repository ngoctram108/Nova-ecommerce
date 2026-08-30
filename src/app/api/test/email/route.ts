import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  
  if (!host || !user || !pass) {
    return NextResponse.json({ status: 'FAIL', reason: 'SMTP credentials (HOST, USER, PASSWORD) are not set in Vercel' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Verify connection configuration
    await transporter.verify();

    return NextResponse.json({
      status: 'PASS',
      message: 'SMTP connection verified successfully',
      host: host,
      user: user,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'FAIL', reason: err.message });
  }
}
