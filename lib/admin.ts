import crypto from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'memorial_admin';

function getPassword() {
  return process.env.ADMIN_PASSWORD || '';
}

export function adminToken() {
  const password = getPassword();
  if (!password) return '';
  return crypto.createHash('sha256').update(`memorial-admin:${password}`).digest('hex');
}

export function isAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value || '';
  const expected = adminToken();
  return Boolean(expected) && token === expected;
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function adminPasswordConfigured() {
  return Boolean(getPassword());
}

export function checkAdminPassword(value: string) {
  const password = getPassword();
  return Boolean(password) && value === password;
}
