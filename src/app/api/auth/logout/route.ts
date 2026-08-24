import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/Backend/auth/session';

export async function POST() {
  await deleteSession();
  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL('/login', request.url));
}
