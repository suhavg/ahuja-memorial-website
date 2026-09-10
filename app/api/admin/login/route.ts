import { NextResponse } from 'next/server';
import { adminCookieName, adminToken, checkAdminPassword } from '@/lib/admin';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || '');

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(adminCookieName(), adminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
