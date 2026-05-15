import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function serializeCookie(name: string, value: string, maxAgeSeconds?: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const maxAge = typeof maxAgeSeconds === 'number' ? `; Max-Age=${maxAgeSeconds}` : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax${secure}${maxAge}`;
}

export const setAuthCookie = (res: VercelResponse, token: string) =>
  res.setHeader('Set-Cookie', serializeCookie(COOKIE_NAME, token, AUTH_COOKIE_MAX_AGE_SECONDS));

export const clearAuthCookie = (res: VercelResponse) =>
  res.setHeader('Set-Cookie', serializeCookie(COOKIE_NAME, '', 0));

export function readAuthCookie(req: VercelRequest) {
  const cookies = req.headers.cookie || '';
  const item = cookies
    .split(';')
    .map((x) => x.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return item ? decodeURIComponent(item.slice(COOKIE_NAME.length + 1)) : null;
}
