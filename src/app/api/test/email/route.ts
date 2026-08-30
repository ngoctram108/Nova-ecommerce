import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'NORA <onboarding@resend.dev>';
  
  if (!apiKey) {
    return NextResponse.json({ status: 'FAIL', reason: 'RESEND_API_KEY is not set in Vercel' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: ['truongtram2k4@gmail.com'],
        subject: 'NORA — Test Email Integration',
        html: '<p>This is a test email to verify Resend API integration.</p>',
      }),
    });

    const data = await response.text();
    
    return NextResponse.json({
      status: response.ok ? 'PASS' : 'FAIL',
      statusCode: response.status,
      from: fromEmail,
      responseBody: data,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'FAIL', reason: err.message });
  }
}
