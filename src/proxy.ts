import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientKey, createRateLimiter } from './lib/rate-limit'

const loginLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })
const apiLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 })

export const config = { matcher: '/api/:path*' }

export function proxy(request: NextRequest) {
  const isLogin = request.method === 'POST' && request.nextUrl.pathname === '/api/users/login'
  const result = (isLogin ? loginLimiter : apiLimiter).check(clientKey(request.headers))

  if (!result.allowed) {
    return NextResponse.json(
      { errors: [{ message: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' }] },
      { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } },
    )
  }
  return NextResponse.next()
}
